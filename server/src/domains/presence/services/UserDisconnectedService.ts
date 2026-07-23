import type { PresenceRepository } from "../ports/PresenceRepository";
import type { AuthAndAccessSocket } from "../../authAndAccess/ports/AuthAndAccessSocket";
import type { GetUsersContactsService } from "../../authAndAccess/services/GetUsersContactsService";
import { PresenceEvents } from "../socketEvents";

export class UserDisconnectedService {
  constructor(
    private readonly presenceRepo: PresenceRepository,
    private readonly socket: AuthAndAccessSocket,
    private readonly getUsersContactsService: GetUsersContactsService,
  ) {}

  async execute({
    userId,
    roomIds,
  }: {
    userId: string;
    roomIds: string[];
  }): Promise<void> {
    try {
      await this.presenceRepo.setOffline({ userId });

      const { contacts } = await this.getUsersContactsService.execute({ userId });

      await Promise.all([
        ...contacts.map((contact) =>
          this.socket.emitToUser({
            userId: contact.userId,
            event: PresenceEvents.OFFLINE,
            payload: { userId },
          }),
        ),
        ...roomIds.map((roomId) =>
          this.socket.emitToRoom({
            roomId,
            event: PresenceEvents.OFFLINE,
            payload: { userId },
          }),
        ),
      ]);
    } catch (error) {
      console.error("[UserDisconnectedService]", error);
    }
  }
}
