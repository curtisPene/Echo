import z from "zod";
import { userSchema } from "@/features/auth/types";
import { apiResponseSchema } from "@/types";
import { roomSchema } from "@/features/rooms/types";
import { messageSchema } from "@/features/messaging/types";
import { contactSchema } from "@/features/contacts/types";

export const appContextSchema = z.object({
  id: z.literal("current"),
  user: userSchema,
  lastSync: z.string().nullable(),
});

export type AppContext = z.infer<typeof appContextSchema>;

export const appSyncResponseSchema = apiResponseSchema(
  z.object({
    rooms: z.array(roomSchema),
    messages: z.array(messageSchema),
    contacts: z.array(contactSchema),
  }),
);

export type AppSyncResponse = z.infer<typeof appSyncResponseSchema>;
