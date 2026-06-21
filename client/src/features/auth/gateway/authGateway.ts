import { httpClient } from "@/lib/httpClient";
import {
  loginResponseSchema,
  registrationResponseSchema,
  type LoginDto,
  type LoginResponse,
  type UserRegistrationDto,
  type RegistrationResponse,
} from "../types";

export async function loginGateway(
  loginData: LoginDto,
): Promise<LoginResponse> {
  const loginResponse = await httpClient.post("/auth/login", loginData);
  return loginResponseSchema.parse(loginResponse.data);
}

export async function registrationGateway(
  registrationData: UserRegistrationDto,
): Promise<RegistrationResponse> {
  const registrationResponse = await httpClient.post(
    "/auth/register",
    registrationData,
  );
  return registrationResponseSchema.parse(registrationResponse.data);
}

export async function verifyRefreshTokenGateway(): Promise<LoginResponse> {
  try {
    const tokenVerificationResponse = await httpClient.post("/auth/verify");
    return loginResponseSchema.parse(tokenVerificationResponse.data);
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Token verification failed",
      data: null,
    };
  }
}
