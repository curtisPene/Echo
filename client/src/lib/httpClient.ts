import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuth } from "@/stores/useAuth";
import { loginResponseSchema } from "@/domains/authAndAccess/types";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { HttpError } from "@/errors/HttpError";

const baseURL = import.meta.env.VITE_API_URL;

export const httpClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const auth = useAuth.getState();
  if (auth.authStatus === "authenticated") {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// The API always responds with a well-formed { success, message, data }
// body, even on 4xx/5xx - that's a real response, not an exceptional one.
// The only genuine failure is a missing/unparseable body (route doesn't
// exist, network down, etc), which is when we actually want to throw.
function isWellFormedApiResponse(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as { success?: unknown }).success === "boolean" &&
    typeof (data as { message?: unknown }).message === "string"
  );
}

function resolveOrThrow(error: AxiosError) {
  if (isWellFormedApiResponse(error.response?.data)) {
    return error.response;
  }
  throw error;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const isVerifyCall = originalRequest?.url === "/auth/verify";

    // We only try to fix 401 errors (means: access token expired/invalid).
    // Anything else (404, 500, etc) just resolves with its body below. We
    // also give up if we already retried this request once, or if the
    // verify call itself is what failed (otherwise we'd retry verify
    // forever).
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retried ||
      isVerifyCall
    ) {
      return resolveOrThrow(error);
    }
    originalRequest._retried = true;

    // Try to get a new access token using the refresh token cookie.
    try {
      const verifyResponse = await axios.post(
        `${baseURL}/auth/verify`,
        {},
        { withCredentials: true },
      );
      const verified = parseOrThrow(loginResponseSchema, verifyResponse.data);

      if (!verified.success || !verified.data) {
        return resolveOrThrow(error);
      }

      // Got a new token! Save it so the rest of the app sees us as logged in.
      useAuth.getState().setAuth({
        authStatus: "authenticated",
        user: verified.data.user,
        accessToken: verified.data.accessToken,
      });

      // Retry the original request, now with the new token attached.
      originalRequest.headers.Authorization = `Bearer ${verified.data.accessToken}`;
      return httpClient(originalRequest);
    } catch (refreshError) {
      // An HttpError means the verify response had a shape we don't
      // recognize at all - propagate it instead of treating it as a
      // normal expired-refresh-token logout, so the caller's service
      // surfaces it as a real failure rather than silently logging out.
      if (refreshError instanceof HttpError) throw refreshError;

      // Refresh failed too (refresh token expired) - log the user out.
      useAuth.getState().setAuth({ authStatus: "unauthenticated", user: null });
      return resolveOrThrow(error);
    }
  },
);
