import { ZodError } from "zod";
import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import {
  loginResponseSchema,
  registrationResponseSchema,
  type LoginDto,
  type LoginResponse,
  type UserRegistrationDto,
  type RegistrationResponse,
} from "../types";

export async function loginAPI(loginData: LoginDto): Promise<LoginResponse> {
  const loginResponse = await httpClient.post("/auth/login", loginData);
  return parseOrReportError(loginResponseSchema, loginResponse.data);
}

export async function registrationAPI(
  registrationData: UserRegistrationDto,
): Promise<RegistrationResponse> {
  const registrationResponse = await httpClient.post(
    "/auth/register",
    registrationData,
  );
  return parseOrReportError(
    registrationResponseSchema,
    registrationResponse.data,
  );
}

export async function verifyRefreshTokenAPI(): Promise<LoginResponse> {
  try {
    const tokenVerificationResponse = await httpClient.post("/auth/verify");
    return parseOrReportError(
      loginResponseSchema,
      tokenVerificationResponse.data,
    );
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
