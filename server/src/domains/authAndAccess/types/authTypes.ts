import { z } from "zod";
import type { NewAuthUserInput } from "../domainModels/authUser";

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{1,50}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,64}$/;

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
      "Password must be 8-64 characters and contain an uppercase letter, lowercase letter, number, and symbol",
    ),
  confirmPassword: z.string(),
}) satisfies z.ZodType<NewAuthUserInput>;

export type UserRegistrationDto = z.infer<typeof userRegistrationSchema>;

export const userLoginSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
}) satisfies z.ZodType<Pick<NewAuthUserInput, "email" | "password">>;

export type UserLoginDto = z.infer<typeof userLoginSchema>;

// No request schema for logout - like deleteAccountController, the acting
// user comes from req.user (set by the auth middleware from the verified
// access token), never from client-supplied input.

// Socket handshake auth payload - not anchored to a domain DTO since
// accessToken is a pure auth-transport value, not a field on any domain
// object (nothing to Pick<> from).
export const socketHandshakeAuthSchema = z.object({
  accessToken: z.string(),
});

export type SocketHandshakeAuth = z.infer<typeof socketHandshakeAuthSchema>;
