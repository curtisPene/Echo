import { apiResponseSchema } from "@/types";
import z from "zod";
import type { ParticipantDTO, RoomDTO } from "../entities/room";

export const participantSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  status: z.enum(["pending", "accepted"]),
}) satisfies z.ZodType<ParticipantDTO>;

export const roomSchema = z.object({
  id: z.string(),
  participants: z.array(participantSchema),
  name: z.string(),
}) satisfies z.ZodType<RoomDTO>;

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

export const updateRoomInviteResultSchema = z.discriminatedUnion(
  "roomDeleted",
  [
    z.object({ roomDeleted: z.literal(true), roomId: z.string() }),
    z.object({ roomDeleted: z.literal(false), room: roomSchema }),
  ],
);

export type UpdateRoomInviteResult = z.infer<
  typeof updateRoomInviteResultSchema
>;

export const acceptRoomInviteResponseSchema = apiResponseSchema(
  updateRoomInviteResultSchema,
);

export type AcceptRoomInviteResponse = z.infer<
  typeof acceptRoomInviteResponseSchema
>;

export const addParticipantResponseSchema = apiResponseSchema(roomSchema);

export type AddParticipantResponse = z.infer<
  typeof addParticipantResponseSchema
>;

export const renameRoomResponseSchema = apiResponseSchema(roomSchema);

export type RenameRoomResponse = z.infer<typeof renameRoomResponseSchema>;
