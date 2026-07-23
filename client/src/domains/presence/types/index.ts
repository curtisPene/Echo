import z from "zod";

export const presencePayloadSchema = z.object({
  userId: z.string(),
});

export type PresencePayload = z.infer<typeof presencePayloadSchema>;
