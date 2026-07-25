import z from "zod";
import type { ParticipantEntity, RoomDTO } from "../entities/room";

export const createNewRoomRequestSchema = z.object({
  name: z.string().min(1),
  participants: z.array(z.object({ id: z.string() })).min(1),
}) satisfies z.ZodType<{
  name: string;
  participants: Pick<ParticipantEntity, "id">[];
}>;

export type CreateNewRoomRequest = z.infer<typeof createNewRoomRequestSchema>;

export const acceptRoomInviteRequestSchema = z.object({
  roomId: z.string(),
  isAcceptRequest: z.boolean(),
}) satisfies z.ZodType<{ roomId: RoomDTO["id"]; isAcceptRequest: boolean }>;

export type AcceptRoomInviteRequest = z.infer<
  typeof acceptRoomInviteRequestSchema
>;

export const addParticipantRequestSchema = z.object({
  roomId: z.string(),
  participantId: z.string(),
}) satisfies z.ZodType<{
  roomId: RoomDTO["id"];
  participantId: ParticipantEntity["id"];
}>;

export type AddParticipantRequest = z.infer<typeof addParticipantRequestSchema>;

export const renameRoomRequestSchema = z.object({
  roomId: z.string(),
  name: z.string().min(1),
}) satisfies z.ZodType<{ roomId: RoomDTO["id"]; name: RoomDTO["name"] }>;

export type RenameRoomRequest = z.infer<typeof renameRoomRequestSchema>;
