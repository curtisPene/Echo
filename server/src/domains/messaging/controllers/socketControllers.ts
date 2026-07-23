import {
  onMessageSendPayloadSchema,
  onMessageDeliveredPayloadSchema,
  onMessageReadPayloadSchema,
} from "../types";
import type { AuthSocket } from "../../../socket";
import { CreateMessageService } from "../services/createMessageService";
import { MessageStatusUpdateService } from "../services/MessageStatusUpdateService";
import { MessageDTO, SenderEntity } from "../entities/message";
import { ServiceResult } from "../../../types";

export class MessagingControllers {
  constructor(
    private readonly createMessageService: CreateMessageService,
    private readonly messageStatusUpdateService: MessageStatusUpdateService,
  ) {}

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

  onMessageDeliveredController = async ({
    socket,
    payload,
    ack,
  }: {
    socket: AuthSocket;
    payload: unknown;
    ack: (response: ServiceResult<{ message: MessageDTO }>) => void;
  }) => {
    const parsed = onMessageDeliveredPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      return ack({
        success: false,
        message: "Invalid input",
        data: null,
      });
    }

    const serviceResult = await this.messageStatusUpdateService.execute({
      messageId: parsed.data.messageId,
      userId: socket.data.identity.id,
      kind: "delivered",
    });

    ack(serviceResult);
  };

  onMessageReadController = async ({
    socket,
    payload,
    ack,
  }: {
    socket: AuthSocket;
    payload: unknown;
    ack: (response: ServiceResult<{ message: MessageDTO }>) => void;
  }) => {
    const parsed = onMessageReadPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      return ack({
        success: false,
        message: "Invalid input",
        data: null,
      });
    }

    const serviceResult = await this.messageStatusUpdateService.execute({
      messageId: parsed.data.messageId,
      userId: socket.data.identity.id,
      kind: "read",
    });

    ack(serviceResult);
  };
}
