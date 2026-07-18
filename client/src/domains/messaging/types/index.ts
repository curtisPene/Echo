import { apiResponseSchema } from "@/types";
import z from "zod";

export const senderSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export type SenderDTO = z.infer<typeof senderSchema>;

export const reactionSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  emoji: z.string(),
});

export type ReactionDTO = z.infer<typeof reactionSchema>;

export const readSchema = z.object({
  userId: z.string(),
  readAt: z.iso.datetime(),
});

export type ReadDTO = z.infer<typeof readSchema>;

const messageBaseSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  createdAt: z.iso.datetime(),
});

export const normalMessageSchema = messageBaseSchema.extend({
  redacted: z.literal(false),
  sender: senderSchema,
  text: z.string(),
  reactions: z.array(reactionSchema),
  readBy: z.array(readSchema),
});

export const redactedMessageSchema = messageBaseSchema.extend({
  redacted: z.literal(true),
  sender: z.null(),
  text: z.null(),
  reactions: z.array(reactionSchema),
  readBy: z.array(readSchema),
});

export const messageSchema = z.discriminatedUnion("redacted", [
  normalMessageSchema,
  redactedMessageSchema,
]);

export type MessageDTO = z.infer<typeof messageSchema>;

export const onMessageReceivePayloadSchema = apiResponseSchema(
  z.object({
    message: messageSchema,
  }),
);

export type MessageReceivePayload = z.infer<
  typeof onMessageReceivePayloadSchema
>;

export const messageSendPayloadSchema = z.object({
  text: z.string(),
  roomId: z.string(),
});

export type MessageSendPayload = z.infer<typeof messageSendPayloadSchema>;
