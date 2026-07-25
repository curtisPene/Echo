import { httpClient } from "@/lib/httpClient";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { HttpError } from "@/errors/HttpError";
import {
  loginResponseSchema,
  registrationResponseSchema,
  logoutResponseSchema,
  deleteAccountResponseSchema,
} from "../types";
import type { LoginArgs } from "../services/LoginService";
import type { RegistrationServiceArgs } from "../services/RegistrationService";
import { User } from "../entities/user";
import type { ServiceResult } from "@/types";
import type { AuthApi } from "../ports/AuthApi";

export type LoginAPIResult = ServiceResult<{
  accessToken: string;
  user: User;
}>;

function toLoginResult(data: unknown): LoginAPIResult {
  const parsed = parseOrThrow(loginResponseSchema, data);

  if (!parsed.success || !parsed.data) {
    return { success: false, message: parsed.message, data: null };
  }

  return {
    success: true,
    message: parsed.message,
    data: {
      accessToken: parsed.data.accessToken,
      user: User.hydrate(parsed.data.user),
    },
  };
}

export class HttpAuthApi implements AuthApi {
  async login(loginData: LoginArgs): Promise<LoginAPIResult> {
    const loginResponse = await httpClient.post("/auth/login", loginData);
    return toLoginResult(loginResponse.data);
  }

  async register(registrationData: RegistrationServiceArgs) {
    const registrationResponse = await httpClient.post(
      "/auth/register",
      registrationData,
    );
    return parseOrThrow(registrationResponseSchema, registrationResponse.data);
  }

  async verifyRefreshToken(): Promise<LoginAPIResult> {
    try {
      const tokenVerificationResponse = await httpClient.post("/auth/verify");
      return toLoginResult(tokenVerificationResponse.data);
    } catch (error) {
      // A 401 here never throws - httpClient resolves it as a normal response
      // (well-formed body) and parseOrThrow parses it successfully. This
      // catch only exists for a genuine transport-level failure (network down,
      // unparseable/non-JSON body), which axios throws as a raw AxiosError -
      // that gets treated as "logged out" too rather than crashing. An
      // HttpError means the server sent a shape we don't recognize at all;
      // let it propagate to the caller's service instead of masking it as a
      // normal logged-out state.
      if (error instanceof HttpError) throw error;

      console.error(error);
      return {
        success: false,
        message: "Token verification failed",
        data: null,
      };
    }
  }

  async logout(): Promise<ServiceResult<null>> {
    const response = await httpClient.post("/auth/logout");
    return parseOrThrow(logoutResponseSchema, response.data);
  }

  async deleteAccount(): Promise<ServiceResult<null>> {
    const response = await httpClient.post("/auth/delete-account");
    return parseOrThrow(deleteAccountResponseSchema, response.data);
  }
}
