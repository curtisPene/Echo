import { ZodError, type z } from "zod";
import { HttpError } from "@/errors/HttpError";

export function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new HttpError(error.message);
    }
    throw error;
  }
}
