import type { PresenceRepository } from "../ports/PresenceRepository";
import type { AuthAndAccessSocket } from "../../authAndAccess/ports/AuthAndAccessSocket";
import type { GetUsersContactsService } from "../../authAndAccess/services/GetUsersContactsService";
import { PresenceEvents } from "../socketEvents";

export class UserConnectedService {
  constructor(
    private readonly presenceRepo: PresenceRepository,
    private readonly socket: AuthAndAccessSocket,
    private readonly getUsersContactsService: GetUsersContactsService,
  ) {}

  async execute({ userId }: { userId: string }): Promise<void> {
    try {
      await this.presenceRepo.setOnline({ userId });

      const { contacts } = await this.getUsersContactsService.execute({ userId });

      await Promise.all(
        contacts.map((contact) =>
          this.socket.emitToUser({
            userId: contact.userId,
            event: PresenceEvents.ONLINE,
            payload: { userId },
          }),
        ),
      );
    } catch (error) {
      console.error("[UserConnectedService]", error);
    }
  }
}
