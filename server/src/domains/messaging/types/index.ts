import z from "zod";
import type { NewMessage } from "../entities/message";

export const onMessageSendPayloadSchema = z.object({
  roomId: z.string(),
  text: z.string(),
}) satisfies z.ZodType<Omit<NewMessage, "sender">>;

export type OnMessageSendPayload = z.infer<typeof onMessageSendPayloadSchema>;
