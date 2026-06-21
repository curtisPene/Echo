import { useState, type FormEvent } from "react";
import { loginGateway } from "../gateway/authGateway";
import { useAuth } from "@/stores/useAuth";
import type { LoginDto } from "../types";

export type AuthError = {
  error: boolean;
  message: string;
  info: {
    email: string;
    password: string;
  };
};

export const useLogin = (state: LoginDto) => {
  const setAuth = useAuth((state) => state.setAuth);

  const [error, setError] = useState<AuthError>({
    error: false,
    message: "",
    info: {
      email: "",
      password: "",
    },
  });

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await loginGateway(state);

    if (result.success && result.data) {
      const { data } = result;
      setAuth({
        authStatus: "authenticated",
        user: data.user,
        accessToken: data.accessToken,
      });
    } else {
      setError({ error: true, message: "Invalid credentials", info: state });
    }
  };

  return { error, onLogin };
};
