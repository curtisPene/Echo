import { z } from "zod";

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema.nullable(),
  });

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type ServiceResult<T, E = undefined> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; data: E };
