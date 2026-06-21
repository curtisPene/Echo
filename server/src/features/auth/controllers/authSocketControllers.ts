import { Socket } from "socket.io";
import { client as redisClient } from "../../../redis";

export const onConnection = (socket: Socket) => {
  const { id, accessToken } = socket.handshake.auth;
  const sid = socket.id;
  redisClient.hSet(`user:${id}`, { socketId: sid, accessToken });
};

export const onMessage = (socket: Socket) => {
  socket.on("message:send", (message) => {
    console.log("message", message);
    socket.broadcast.emit("message:received", message);
  });
};
