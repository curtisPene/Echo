import z from "zod";
import { apiResponseSchema } from "@/types";

export const contactSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

export type Contact = z.infer<typeof contactSchema>;

export const contactsSearchResponseSchema = apiResponseSchema(contactSchema);

export type ContactsSearchResponse = z.infer<
  typeof contactsSearchResponseSchema
>;
