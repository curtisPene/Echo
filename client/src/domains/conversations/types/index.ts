import { apiResponseSchema } from "@/types";
import z from "zod";

export const participantSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  status: z.enum(["pending", "accepted"]),
});

export type ParticipantDTO = z.infer<typeof participantSchema>;

export const roomSchema = z.object({
  id: z.string(),
  participants: z.array(participantSchema),
  name: z.string(),
});

export type RoomDTO = z.infer<typeof roomSchema>;

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

export const acceptRoomInviteResponseSchema = apiResponseSchema(roomSchema);

export type AcceptRoomInviteResponse = z.infer<
  typeof acceptRoomInviteResponseSchema
>;
