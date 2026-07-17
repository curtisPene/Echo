import { useState, type FormEvent } from "react";
import { loginController } from "../controllers/LoginController";

export const useLoginViewModel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const result = await loginController({ email, password });

    if (!result.success) {
      setError(result.message);
    }
  };

  return { email, setEmail, password, setPassword, error, onSubmit };
};
