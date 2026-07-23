import { apiResponseSchema } from "@/types";
import z from "zod";
import type {
  SenderDTO,
  ReactionDTO,
  ReadDTO,
  MessageDTO,
  DeliveryStatus,
} from "../entities/message";

export const deliveryStatusSchema = z.enum([
  "sending",
  "sent",
  "delivered",
  "read",
  "failed",
]) satisfies z.ZodType<DeliveryStatus>;

export const senderSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
}) satisfies z.ZodType<SenderDTO>;

export const reactionSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  emoji: z.string(),
}) satisfies z.ZodType<ReactionDTO>;

export const readSchema = z.object({
  userId: z.string(),
  readAt: z.iso.datetime(),
}) satisfies z.ZodType<ReadDTO>;

const messageBaseSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  createdAt: z.iso.datetime(),
  deliveredTo: z.array(z.string()),
  deliveryStatus: deliveryStatusSchema,
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
  reactions: z.null(),
  readBy: z.null(),
});

export const messageSchema = z.discriminatedUnion("redacted", [
  normalMessageSchema,
  redactedMessageSchema,
]) satisfies z.ZodType<MessageDTO>;

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

export const messageDeliveredPayloadSchema = z.object({
  messageId: z.string(),
});

export type MessageDeliveredPayload = z.infer<
  typeof messageDeliveredPayloadSchema
>;

export const messageReadPayloadSchema = z.object({
  messageId: z.string(),
});

export type MessageReadPayload = z.infer<typeof messageReadPayloadSchema>;
