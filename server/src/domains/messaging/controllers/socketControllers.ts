import { onMessageSendPayloadSchema } from "../types";
import type { AuthSocket } from "../../../socket";
import { CreateMessageService } from "../services/createMessageService";
import { MessageDTO, SenderEntity } from "../domainModels/message";
import { ServiceResult } from "../../../types";

export class MessagingControllers {
  constructor(private readonly createMessageService: CreateMessageService) {}

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

    const isInRoom = socket.rooms.has(parsed.data.roomId);
    if (!isInRoom) {
      return ack({
        success: false,
        message: "Unauthorized room access",
        data: null,
      });
    }

    const { id, firstName, lastName } = socket.data.identity;
    const sender = { id, firstName, lastName } satisfies SenderEntity;

    const serviceResult = await this.createMessageService.execute({
      sender,
      newMessage: parsed.data,
    });

    ack(serviceResult);
  };
}
