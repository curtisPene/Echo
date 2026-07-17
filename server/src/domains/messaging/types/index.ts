import z from "zod";

export const onMessageSendPayloadSchema = z.object({
  roomId: z.string(),
  message: z.string(),
});

export type OnMessageSendPayload = z.infer<typeof onMessageSendPayloadSchema>;
