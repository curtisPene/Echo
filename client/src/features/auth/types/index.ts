import { z } from "zod";
import { apiResponseSchema } from "@/types";

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const loginResponseSchema = apiResponseSchema(
  z.object({
    accessToken: z.string(),
    user: userSchema,
  }),
);

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const registrationFailureReasonSchema = z.enum([
  "duplicate_email",
  "validation",
  "unknown",
]);

export const registrationResponseSchema = apiResponseSchema(
  z.null(),
  z.object({ reason: registrationFailureReasonSchema }),
);

export type RegistrationResponse = z.infer<typeof registrationResponseSchema>;

export type LoginDto = {
  email: string;
  password: string;
};

export type UserRegistrationDto = {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
};
