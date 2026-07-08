import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import { createNewRoomAPIResponseSchema } from "../types";

export const createNewRoomAPI = async ({
  participants,
  name,
}: {
  participants: string[];
  name: string;
}) => {
  const response = await httpClient.post("/rooms/", {
    participants,
    name,
  });

  return parseOrReportError(createNewRoomAPIResponseSchema, response.data);
};
