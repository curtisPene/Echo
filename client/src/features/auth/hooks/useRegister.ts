import { useState, type FormEvent } from "react";
import { registrationService } from "../services/registrationService";
import { useNavigate } from "react-router";
import type { UserRegistrationDto } from "../types";

export type RegistrationError = {
  error: boolean;
  message: string;
  info: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
  };
};

export const useRegister = (state: UserRegistrationDto) => {
  const [error] = useState<RegistrationError>({
    error: false,
    message: "",
    info: { userName: "", firstName: "", lastName: "", email: "" },
  });
  const navigate = useNavigate();
  const onRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await registrationService(state);

    if (result.success) {
      navigate("/login");
    } else {
      console.log(result);
    }
  };
  return { error, onRegister };
};
