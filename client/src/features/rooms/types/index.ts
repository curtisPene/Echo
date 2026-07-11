import { apiResponseSchema } from "@/types";
import z from "zod";

export const roomParticipantUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

export const roomParticipantSchema = z.object({
  user: roomParticipantUserSchema,
  lastReadAt: z.iso.datetime().nullable(),
  status: z.enum(["pending", "accepted"]),
});

export type RoomParticipant = z.infer<typeof roomParticipantSchema>;

export const roomSchema = z.object({
  id: z.string(),
  participants: z.array(roomParticipantSchema),
  name: z.string(),
});

export type Room = z.infer<typeof roomSchema>;

export const createNewRoomAPIResponseSchema = apiResponseSchema(roomSchema);

export type CreateNewRoomAPIResponse = z.infer<
  typeof createNewRoomAPIResponseSchema
>;

export const roomUnreadCountSchema = z.object({
  roomId: z.string(),
  unread: z.number(),
});

export type RoomUnreadCount = z.infer<typeof roomUnreadCountSchema>;

export const onRoomUpdatedPayloadSchema = z.object({
  room: roomSchema,
});

export type RoomUpdatedPayload = z.infer<typeof onRoomUpdatedPayloadSchema>;
