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

      // The fan-out above only tells this user's contacts that THEY have a
      // new online contact - it says nothing about who was already online
      // before this user connected. Without this, a freshly-connected
      // client would see every contact as offline until each one happens
      // to reconnect after them. This is the on-load snapshot query the
      // Redis-backed presence store exists for.
      const onlineStatuses = await this.presenceRepo.getOnlineStatuses({
        userIds: contacts.map((contact) => contact.userId),
      });

      await Promise.all(
        contacts
          .filter((contact) => onlineStatuses[contact.userId])
          .map((contact) =>
            this.socket.emitToUser({
              userId,
              event: PresenceEvents.ONLINE,
              payload: { userId: contact.userId },
            }),
          ),
      );
    } catch (error) {
      console.error("[UserConnectedService]", error);
    }
  }
}
