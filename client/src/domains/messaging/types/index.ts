import { apiResponseSchema } from "@/types";
import { roomSchema } from "@/domains/presence/types";
import z from "zod";

/**
 * Database schema types for Message feature
 */

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

export const onMessageReceivePayloadSchema = apiResponseSchema(
  z.object({
    message: messageSchema,
  }),
);

export type MessageReceivePayload = z.infer<
  typeof onMessageReceivePayloadSchema
>;

export const messageSendPayloadSchema = z.object({
  message: z.string(),
  roomId: z.string(),
});

export type MessageSendPayload = z.infer<typeof messageSendPayloadSchema>;

export const updateRoomParticipantResponseSchema =
  apiResponseSchema(roomSchema);

export type UpdateRoomParticipantResponse = z.infer<
  typeof updateRoomParticipantResponseSchema
>;
