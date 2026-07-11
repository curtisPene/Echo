import { loginAPI } from "../api/authAPI";
import type { User } from "../types";
import type { ServiceResult } from "@/types";

export type LoginArgs = {
  email: string;
  password: string;
};

export async function loginService({
  email,
  password,
}: LoginArgs): Promise<ServiceResult<{ accessToken: string; user: User }>> {
  const result = await loginAPI({ email, password });

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
