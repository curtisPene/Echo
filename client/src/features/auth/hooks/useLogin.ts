import { useState, type FormEvent } from "react";
import { loginService } from "../services/loginService";
import type { LoginDto } from "../types";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";

export type AuthError = {
  error: boolean;
  message: string;
  info: {
    email: string;
    password: string;
  };
};

export const useLogin = (state: LoginDto) => {
  const [error, setError] = useState<AuthError>({
    error: false,
    message: "",
    info: { email: "", password: "" },
  });

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await loginService(state);

    if (!result.success) {
      return setError({ error: true, message: result.message, info: state });
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
