import { Socket } from "socket.io";
// import { client as redisClient } from "../../../redis";
import { verifyAccessTokenService } from "../services/verifyAccessTokenService";
import { addUserToRoomsService } from "../../users/services/addUserToRoomsService";

export const onConnectionController = (socket: Socket) => {
  const { id, accessToken } = socket.handshake.auth;
  const sid = socket.id;
  // redisClient.hSet(`user:${id}`, { socketId: sid, accessToken });
  const result = verifyAccessTokenService({ accessToken });

  if (!result.success || !result.data) {
    socket.emit("auth:unauthorized");
    socket.disconnect();
    return;
  }

  socket.data.userId = result.data.id;

  addUserToRoomsService({ socket, userId: id });
};
