import type { ServiceResult } from "@/types";
import type { AuthApi } from "../ports/AuthApi";

export type RegistrationServiceArgs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const patterns = {
  firstName: /^[a-zA-Z]{1,32}$/,
  lastName: /^[a-zA-Z]{1,32}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,64}$/,
};

function validate(
  fields: RegistrationServiceArgs,
): { valid: true } | { valid: false; message: string } {
  if (!patterns.firstName.test(fields.firstName))
    return { valid: false, message: "Invalid first name" };
  if (!patterns.lastName.test(fields.lastName))
    return { valid: false, message: "Invalid last name" };
  if (!patterns.email.test(fields.email))
    return { valid: false, message: "Invalid email" };
  if (!patterns.password.test(fields.password))
    return { valid: false, message: "Invalid password" };
  if (fields.password !== fields.confirmPassword)
    return { valid: false, message: "Passwords do not match" };
  return { valid: true };
}

export class RegistrationService {
  private readonly authApi: AuthApi;

  constructor(authApi: AuthApi) {
    this.authApi = authApi;
  }

  async execute({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  }: RegistrationServiceArgs): Promise<
    ServiceResult<null, { reason: "unknown" | "duplicate_email" | "validation" }>
  > {
    const validation = validate({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
        data: { reason: "validation" },
      };
    }

    const response = await this.authApi.register({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    return response;
  }
}
