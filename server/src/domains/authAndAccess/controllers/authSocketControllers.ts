import { Socket } from "socket.io";
import { verifyAccessTokenService } from "../composition";
import { addUserToRoomsService } from "../services/addUserToRoomsService";

export const onConnectionController = (socket: Socket) => {
  const { id, accessToken } = socket.handshake.auth;
  const sid = socket.id;
  const result = verifyAccessTokenService.execute({ accessToken });

  if (!result.success || !result.data) {
    socket.emit("auth:unauthorized");
    socket.disconnect();
    return;
  }

  socket.data.userId = result.data.id;

  addUserToRoomsService({ socket, userId: id });
};
