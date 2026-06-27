import z from "zod";

// Populated user info, for rendering a name/avatar (e.g. "who reacted", "who read this").
export const messageUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

export const messageReactionSchema = z.object({
  user: messageUserSchema,
  emoji: z.string(),
});

export type MessageReaction = z.infer<typeof messageReactionSchema>;

export const messageReadSchema = z.object({
  user: messageUserSchema,
  readAt: z.iso.datetime(),
});

export type MessageRead = z.infer<typeof messageReadSchema>;

const messageBaseSchema = z.object({
  id: z.string(),
  room: z.string(), // FK -> Room.id, scopes which conversation this message belongs to
  createdAt: z.iso.datetime(),
});

export const normalMessageSchema = messageBaseSchema.extend({
  redacted: z.literal(false),
  sender: z.string(), // user id only (not populated) - UI just compares to currentUserId for bubble alignment
  text: z.string(),
  reactions: z.array(messageReactionSchema),
  readBy: z.array(messageReadSchema),
});

export const redactedMessageSchema = messageBaseSchema.extend({
  redacted: z.literal(true),
  sender: z.null(), // anonymized along with text once redacted
  text: z.null(),
});

export const messageSchema = z.discriminatedUnion("redacted", [
  normalMessageSchema,
  redactedMessageSchema,
]);

export type Message = z.infer<typeof messageSchema>;
