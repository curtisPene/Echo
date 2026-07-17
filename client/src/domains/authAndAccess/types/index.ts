import { z } from "zod";
import { apiResponseSchema } from "@/types";
import type { UserDTO } from "../domainModels/user";
import type { ContactDTO, ContactsDTO } from "../domainModels/contacts";

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
}) satisfies z.ZodType<UserDTO>;

export const contactSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
}) satisfies z.ZodType<ContactDTO>;

export const contactsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  contacts: z.array(contactSchema),
  blocked: z.array(contactSchema),
}) satisfies z.ZodType<ContactsDTO>;

export const registrationFailureReasonSchema = z.enum([
  "duplicate_email",
  "validation",
  "unknown",
]);

export const loginResponseSchema = apiResponseSchema(
  z.object({
    accessToken: z.string(),
    user: userSchema,
  }),
);

export const registrationResponseSchema = apiResponseSchema(
  z.null(),
  z.object({ reason: registrationFailureReasonSchema }),
);

export const contactsSearchResponseSchema = apiResponseSchema(userSchema);

export const addContactResponseSchema = apiResponseSchema(contactSchema);
