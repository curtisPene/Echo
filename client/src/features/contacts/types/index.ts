import z from "zod";
import { apiResponseSchema } from "@/types";

export const contactsSearchResultSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

export const contactsSearchResponseSchema = apiResponseSchema(
  contactsSearchResultSchema,
);

export type Contact = z.infer<typeof contactsSearchResultSchema>;

export type ContactsSearchResponse = z.infer<
  typeof contactsSearchResponseSchema
>;
