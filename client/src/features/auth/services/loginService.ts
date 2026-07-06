import { loginAPI } from "../api/authAPI";
import type { LoginDto, User } from "../types";
import type { ServiceResult } from "@/types";

export async function loginService(
  credentials: LoginDto,
): Promise<ServiceResult<{ accessToken: string; user: User }>> {
  const result = await loginAPI(credentials);

  if (!result.success || !result.data) {
    return {
      success: false as const,
      message: "Invalid credentials",
      data: null,
    };
  }

  return {
    success: true as const,
    message: "Authorized",
    data: {
      accessToken: result.data.accessToken,
      user: result.data.user,
    },
  };
}
