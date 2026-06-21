import z from "zod";
import { userSchema } from "../auth/types";

export const roomParticipantSchema = z.object({
  user: userSchema,
  lastReadAt: z.date().optional(),
});

export type RoomParticipant = z.infer<typeof roomParticipantSchema>;

export const roomSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  participants: z.array(roomParticipantSchema),
  lastMessageAt: z.date().optional(),
});

export type Room = z.infer<typeof roomSchema>;
