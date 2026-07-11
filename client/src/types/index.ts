import { z } from "zod";

export const apiResponseSchema = <
  T extends z.ZodTypeAny,
  E extends z.ZodTypeAny = z.ZodNull,
>(
  successDataSchema: T,
  failureDataSchema: E = z.null() as unknown as E,
) =>
  z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      message: z.string(),
      data: successDataSchema,
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
      data: failureDataSchema,
    }),
  ]);

export type ApiResponse<T, E = undefined> =
  | { success: true; message: string; data: T | null }
  | { success: false; message: string; data: E };

export type ServiceResult<T, E = null> =
  | { success: true; message: string; data: T | null }
  | { success: false; message: string; data: E };
