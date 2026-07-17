import { loginService, type LoginArgs } from "../services/loginService";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";

export type LoginControllerResult =
  | { success: true }
  | { success: false; message: string };

export const loginController = async ({
  email,
  password,
}: LoginArgs): Promise<LoginControllerResult> => {
  const result = await loginService({ email, password });

  if (!result.success || !result.data) {
    return { success: false, message: result.message };
  }

  useAuth.getState().setAuth({
    authStatus: "authenticated",
    user: result.data.user,
    accessToken: result.data.accessToken,
  });
  useAppStatus.getState().setAppStatus("syncing");

  return { success: true };
};
