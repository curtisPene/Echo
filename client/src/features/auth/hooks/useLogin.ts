import { useState, type FormEvent } from "react";
import { loginController } from "../controllers/authController";
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
  const [error, setError] = useState<AuthError>({
    error: false,
    message: "",
    info: { email: "", password: "" },
  });

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await loginController(state);

    if (!result.success) {
      setError({ error: true, message: result.message, info: state });
    }
  };

  return { error, onLogin };
};
