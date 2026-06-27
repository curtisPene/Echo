import { ZodError, type z } from "zod";
import { useGlobalError } from "@/stores/useGlobalError";

export function parseOrReportError<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      useGlobalError.getState().setError(error);
    }
    throw error;
  }
}
