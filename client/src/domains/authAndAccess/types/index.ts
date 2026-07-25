import { z } from "zod";
import { apiResponseSchema } from "@/types";
import type { UserDTO } from "../entities/user";
import type { ContactDTO, ContactsDTO } from "../entities/contacts";
import { roomSchema } from "@/domains/conversations/types";

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
}) satisfies z.ZodType<UserDTO>;

export const contactSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
}) satisfies z.ZodType<ContactDTO>;

export const contactsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  contacts: z.array(contactSchema),
  blocked: z.array(contactSchema),
}) satisfies z.ZodType<ContactsDTO>;

export const registrationFailureReasonSchema = z.enum([
  "duplicate_email",
  "validation",
  "unknown",
]);

export const loginResponseSchema = apiResponseSchema(
  z.object({
    accessToken: z.string(),
    user: userSchema,
  }),
);

export const registrationResponseSchema = apiResponseSchema(
  z.null(),
  z.object({ reason: registrationFailureReasonSchema }),
);

export const deleteAccountResponseSchema = apiResponseSchema(z.null());

export const logoutResponseSchema = apiResponseSchema(z.null());

export const contactsSearchResponseSchema = apiResponseSchema(userSchema);

export const addContactResponseSchema = apiResponseSchema(
  z.object({
    addedUser: contactSchema,
    room: roomSchema,
  }),
);

// Order matters: z.union tries branches in order and returns the first
// match, stripping fields not in that branch's shape. The room-included
// variant must come first, or a group-room update would silently parse as
// the no-room (1:1-deleted) variant since it's a subset match too.
export const blockedRoomResultSchema = z.union([
  z.object({ roomId: z.string(), room: roomSchema }),
  z.object({ roomId: z.string() }),
]);

export type BlockedRoomResult = z.infer<typeof blockedRoomResultSchema>;

export const blockContactResponseSchema = apiResponseSchema(
  z.object({
    blockedContactId: z.string(),
    updatedRooms: z.array(blockedRoomResultSchema),
  }),
);
