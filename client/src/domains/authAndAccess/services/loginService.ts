import { loginAPI, type LoginAPIResult } from "../api/authAPI";

export type LoginArgs = {
  email: string;
  password: string;
};

export async function loginService({
  email,
  password,
}: LoginArgs): Promise<LoginAPIResult> {
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
