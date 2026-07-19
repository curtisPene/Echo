import { onMessageSendPayloadSchema } from "../types";
import { io, type AuthSocket } from "../../../socket";
import { createMessageService } from "../services/createMessageService";
import { MessageDTO } from "../domainModels/message";
import { MessageRepo } from "../repo/mongooseMessageRepo";
import { ServiceResult } from "../../../types";

export class MessagingControllers {
  constructor(private readonly messageRepo: MessageRepo) {}

  onMessageSendController = async ({
    socket,
    payload,
    ack,
  }: {
    socket: AuthSocket;
    payload: unknown;
    ack: (response: ServiceResult<{ message: MessageDTO }>) => void;
  }) => {
    const parsed = onMessageSendPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      return ack({
        success: false,
        message: "Invalid input",
        data: null,
      });
    }

    const { id, firstName, lastName } = socket.data.identity;

    const isInRoom = socket.rooms.has(parsed.data.roomId);
    if (!isInRoom) {
      return ack({
        success: false,
        message: "Unauthorized room access",
        data: null,
      });
    }

    const serviceResult = await createMessageService({
      sender: { id, firstName, lastName },
      newMessage: parsed.data,
      messageRepo: this.messageRepo,
    });

    if (!serviceResult.success) {
      return ack(serviceResult);
    }

    io.to(parsed.data.roomId).emit("message:receive", serviceResult);

    ack(serviceResult);
  };
}
