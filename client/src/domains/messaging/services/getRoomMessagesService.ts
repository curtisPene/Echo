import type { MessageDTO } from "../domainModels/message";

export class GetRoomMessagesService {
  execute({
    messages,
    roomId,
  }: {
    messages: MessageDTO[];
    roomId: string | null;
  }): MessageDTO[] {
    if (!roomId) return [];
    return messages.filter((message) => message.roomId === roomId);
  }
}
