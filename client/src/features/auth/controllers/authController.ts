import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";
import { loginGateway } from "../gateway/authGateway";
import type { LoginDto } from "../types";

export async function loginController(credentials: LoginDto) {
  const result = await loginGateway(credentials);

  if (!result.success || !result.data) {
    return { success: false as const, message: "Invalid credentials" };
  }

  useAuth.getState().setAuth({
    authStatus: "authenticated",
    user: result.data.user,
    accessToken: result.data.accessToken,
  });
  useAppStatus.getState().setAppStatus("syncing");

  return { success: true as const };
}
