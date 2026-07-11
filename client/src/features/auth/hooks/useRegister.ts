import { useState, type FormEvent } from "react";
import { registrationService } from "../services/registrationService";
import type { RegistrationServiceArgs } from "../services/registrationService";
import { useNavigate } from "react-router";

export type RegistrationError = {
  error: boolean;
  message: string;
};

export const useRegister = (state: RegistrationServiceArgs) => {
  const [error, setError] = useState<RegistrationError>({
    error: false,
    message: "",
  });
  const navigate = useNavigate();

  const onRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await registrationService(state);

    if (result.success) {
      navigate("/login");
    } else {
      setError({ error: true, message: result.message });
    }
  };

  return { error, onRegister };
};
