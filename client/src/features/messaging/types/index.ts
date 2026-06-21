import z from "zod";

export const messageReactionSchema = z.object({
  user: z.string(),
  emoji: z.string(),
});

export type MessageReaction = z.infer<typeof messageReactionSchema>;

export const messageReadSchema = z.object({
  user: z.string(),
  readAt: z.iso.datetime(),
});

export type MessageRead = z.infer<typeof messageReadSchema>;

const messageBaseSchema = z.object({
  id: z.string(),
  room: z.string(),
  sender: z.string(),
  createdAt: z.iso.datetime(),
});

export const normalMessageSchema = messageBaseSchema.extend({
  redacted: z.literal(false),
  text: z.string(),
  reactions: z.array(messageReactionSchema),
  readBy: z.array(messageReadSchema),
});

export const redactedMessageSchema = messageBaseSchema.extend({
  redacted: z.literal(true),
  text: z.null(),
});

export const messageSchema = z.discriminatedUnion("redacted", [
  normalMessageSchema,
  redactedMessageSchema,
]);

export type Message = z.infer<typeof messageSchema>;
