import { socket } from "@/lib/socket";

export const contactsSocketAPI = {
  request(payload: { message: string }) {
    socket.emit("contact:request", payload);
  },
};
