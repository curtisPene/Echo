import { ZodError } from "zod";
import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import { loginResponseSchema, registrationResponseSchema } from "../types";
import type { LoginArgs } from "../services/loginService";
import type { RegistrationServiceArgs } from "../services/registrationService";
import { User } from "../domainModels/user";
import type { ServiceResult } from "@/types";

export type LoginAPIResult = ServiceResult<{
  accessToken: string;
  user: User;
}>;

function toLoginResult(data: unknown): LoginAPIResult {
  const parsed = parseOrReportError(loginResponseSchema, data);

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

export async function loginAPI(loginData: LoginArgs): Promise<LoginAPIResult> {
  const loginResponse = await httpClient.post("/auth/login", loginData);
  return toLoginResult(loginResponse.data);
}

export async function registrationAPI(
  registrationData: RegistrationServiceArgs,
) {
  const registrationResponse = await httpClient.post(
    "/auth/register",
    registrationData,
  );
  return parseOrReportError(
    registrationResponseSchema,
    registrationResponse.data,
  );
}

export async function verifyRefreshTokenAPI(): Promise<LoginAPIResult> {
  try {
    const tokenVerificationResponse = await httpClient.post("/auth/verify");
    return toLoginResult(tokenVerificationResponse.data);
  } catch (error) {
    // A 401 here never throws - httpClient resolves it as a normal response
    // (well-formed body) and parseOrReportError parses it successfully. This
    // catch only exists for a genuine transport-level failure (network down,
    // unparseable/non-JSON body), which axios throws as a raw AxiosError -
    // that gets treated as "logged out" too rather than crashing. A ZodError
    // means the server sent a shape we don't recognize at all;
    // parseOrReportError already reported it to the global error store, so
    // let it propagate there instead of masking it as a normal logged-out
    // state.
    if (error instanceof ZodError) throw error;

    console.error(error);
    return {
      success: false,
      message: "Token verification failed",
      data: null,
    };
  }
}
