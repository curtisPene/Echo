import type { ServiceResult } from "@/types";
import { registrationAPI } from "../api/authAPI";

export type RegistrationServiceArgs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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
  return { valid: true };
}

export async function registrationService({
  firstName,
  lastName,
  email,
  password,
}: RegistrationServiceArgs): Promise<
  ServiceResult<null, { reason: "unknown" | "duplicate_email" | "validation" }>
> {
  const validation = validate({ firstName, lastName, email, password });

  if (!validation.valid) {
    return {
      success: false,
      message: validation.message,
      data: { reason: "validation" },
    };
  }

  const response = await registrationAPI({
    firstName,
    lastName,
    email,
    password,
  });

  return response;
}
