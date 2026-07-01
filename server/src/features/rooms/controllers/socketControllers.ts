import { Socket } from "socket.io";
import { OnMessageSendPayload } from "../types";
import { io } from "../../../socket";
import { MessageView } from "../presenters/messagePresenter";
import { createMessageService } from "../services/createMessageService";

export const onMessageSendController = async ({
  socket,
  payload,
  ack,
}: {
  socket: Socket;
  payload: OnMessageSendPayload;
  ack: (response: { message: string }) => void;
}) => {
  const { roomId, message } = payload;
  const userId = socket.data.userId;

  const isInRoom = socket.rooms.has(roomId);
  if (!isInRoom) {
    socket.emit("auth:unauthorized room access");
    return;
  }

  const serviceResult = await createMessageService({ userId, message, roomId });

  if (!serviceResult.success) return;

  io.to(roomId).emit("message:receive", serviceResult);

  ack(serviceResult);
};
