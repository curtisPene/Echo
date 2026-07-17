import z from "zod";

export const sinceSchema = z.iso.datetime().optional();

export type Since = z.infer<typeof sinceSchema>;
