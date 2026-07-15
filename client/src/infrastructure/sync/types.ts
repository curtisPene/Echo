import z from "zod";
import { userSchema } from "@/domains/auth & access/types";
import { apiResponseSchema } from "@/types";
import { roomSchema } from "@/domains/presence/types";
import { messageSchema } from "@/domains/messaging/types";
import { contactSchema } from "@/domains/contacts/types";

export const appContextSchema = z.object({
  id: z.literal("current"),
  user: userSchema,
  lastSync: z.string().nullable(),
});

export type AppContext = z.infer<typeof appContextSchema>;

export const appSyncResponseSchema = apiResponseSchema(
  z.object({
    rooms: z.array(
      z.object({
        room: roomSchema,
        unread: z.number(),
      }),
    ),
    messages: z.array(messageSchema),
    contacts: z.array(contactSchema),
    lastSync: z.string(),
  }),
);

export type AppSyncResponse = z.infer<typeof appSyncResponseSchema>;
