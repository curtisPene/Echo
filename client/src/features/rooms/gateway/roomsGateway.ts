import { httpClient } from "@/lib/httpClient";

export const createNewRoom = async () => {
  const response = await httpClient.post("/rooms/");

  console.log(response);
};
