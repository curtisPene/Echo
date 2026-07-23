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
