import { socket } from "@/lib/socket";

export const contactRequestSocket = (payload: { message: string }) => {
  socket.emit("contact:request", payload);
};
