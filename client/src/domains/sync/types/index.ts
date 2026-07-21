import z from "zod";
import { contactsSchema } from "@/domains/authAndAccess/types";
import { apiResponseSchema } from "@/types";
import { roomSchema } from "@/domains/conversations/types";
import { messageSchema } from "@/domains/messaging/types";

export const appSyncResponseSchema = apiResponseSchema(
  z.object({
    rooms: z.array(
      z.object({
        room: roomSchema,
        unread: z.number(),
      }),
    ),
    messages: z.array(messageSchema),
    contacts: contactsSchema,
    lastSync: z.string(),
  }),
);

export type AppSyncResponse = z.infer<typeof appSyncResponseSchema>;
