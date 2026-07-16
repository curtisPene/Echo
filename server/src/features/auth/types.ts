import { z } from "zod";

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{1,50}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const userRegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .regex(NAME_REGEX, "First name contains invalid characters"),
  lastName: z
    .string()
    .trim()
    .regex(NAME_REGEX, "Last name contains invalid characters"),
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "Password must be at least 8 characters and contain a letter and a number",
    ),
});

export type UserRegistrationDto = z.infer<typeof userRegistrationSchema>;

export const userLoginSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type UserLoginDto = z.infer<typeof userLoginSchema>;

export interface TokenPayload {
  id: string;
}
