import z from "zod";
import type { ContactDTO } from "../domainModels/contacts";

export const searchContactsRequestSchema = z.object({
  email: z.string(),
});

export type SearchContactsRequest = z.infer<typeof searchContactsRequestSchema>;

export const addContactRequestSchema = z.object({
  userId: z.string(),
}) satisfies z.ZodType<Pick<ContactDTO, "userId">>;

export type AddContactRequest = z.infer<typeof addContactRequestSchema>;

export const blockContactRequestSchema = z.object({
  userId: z.string(),
}) satisfies z.ZodType<Pick<ContactDTO, "userId">>;

export type BlockContactRequest = z.infer<typeof blockContactRequestSchema>;
