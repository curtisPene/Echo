import z from "zod";
import type { ParticipantEntity, RoomDTO } from "../domainModels/room";

export const createNewRoomRequestSchema = z.object({
  name: z.string().min(1),
  participants: z.array(z.object({ id: z.string() })).min(1),
}) satisfies z.ZodType<{ name: string; participants: Pick<ParticipantEntity, "id">[] }>;

export type CreateNewRoomRequest = z.infer<typeof createNewRoomRequestSchema>;

export const acceptRoomInviteRequestSchema = z.object({
  roomId: z.string(),
}) satisfies z.ZodType<{ roomId: RoomDTO["id"] }>;

export type AcceptRoomInviteRequest = z.infer<typeof acceptRoomInviteRequestSchema>;
