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
});

export type RoomParticipant = z.infer<typeof roomParticipantSchema>;

export const roomSchema = z.object({
  id: z.string(),
  participants: z.array(roomParticipantSchema),
  name: z.string(),
  lastMessageAt: z.iso.datetime().nullable(),
  lastMessage: z.string().nullable(),
  unread: z.number(),
});

export type Room = z.infer<typeof roomSchema>;
