import z from "zod";

export const searchContactsRequestSchema = z.object({
  email: z.string(),
});

export type SearchContactsRequest = z.infer<typeof searchContactsRequestSchema>;
