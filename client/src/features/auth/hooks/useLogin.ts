import { useState, type FormEvent } from "react";
import { loginService } from "../services/loginService";
import type { LoginArgs } from "../services/loginService";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";

export type AuthError = {
  error: boolean;
  message: string;
};

export const useLogin = (state: LoginArgs) => {
  const [error, setError] = useState<AuthError>({
    error: false,
    message: "",
  });

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await loginService(state);

    if (!result.success || !result.data) {
      return setError({ error: true, message: result.message });
    }

    useAuth.getState().setAuth({
      authStatus: "authenticated",
      user: result.data.user,
      accessToken: result.data.accessToken,
    });
    useAppStatus.getState().setAppStatus("syncing");
  };

  return { error, onLogin };
};
