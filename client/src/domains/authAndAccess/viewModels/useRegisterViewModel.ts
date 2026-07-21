import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { authControllers } from "@/composition";

export const useRegisterViewModel = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const result = await authControllers.register({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/login");
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    onSubmit,
  };
};
