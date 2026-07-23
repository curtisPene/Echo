import z from "zod";
import type { NewMessage } from "../entities/message";

export const onMessageSendPayloadSchema = z.object({
  roomId: z.string(),
  text: z.string(),
}) satisfies z.ZodType<Omit<NewMessage, "sender">>;

export type OnMessageSendPayload = z.infer<typeof onMessageSendPayloadSchema>;

// userId is never taken from this payload - it's derived from the
// authenticated socket's own identity (socket.data.identity), same as
// onMessageSendController's sender - a client can only ever confirm
// delivery/read as itself, never on behalf of another user.
export const onMessageDeliveredPayloadSchema = z.object({
  messageId: z.string(),
});

export type OnMessageDeliveredPayload = z.infer<
  typeof onMessageDeliveredPayloadSchema
>;

export const onMessageReadPayloadSchema = z.object({
  messageId: z.string(),
});

export type OnMessageReadPayload = z.infer<typeof onMessageReadPayloadSchema>;
