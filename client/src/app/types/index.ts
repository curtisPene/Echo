import z from "zod";
import { userSchema } from "@/features/auth/types";

export const appContextSchema = z.object({
  id: z.literal("current"),
  user: userSchema,
  lastSync: z.string().nullable(),
});

export type AppContext = z.infer<typeof appContextSchema>;
