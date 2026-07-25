import { SyncContext } from "../entities/syncContext";
import type { SyncApi } from "../ports/SyncApi";
import type { SyncRepository } from "../ports/SyncRepository";
import type { RoomsRepository } from "@/domains/conversations/ports/RoomsRepository";
import type { ContactsRepository } from "@/domains/authAndAccess/ports/ContactsRepository";
import type { MessagesRepository } from "@/domains/messaging/ports/MessagesRepository";
import type { Auth } from "@/stores/useAuth";
import type { ServiceResult } from "@/types";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class SyncService {
  private readonly syncApi: SyncApi;
  private readonly syncRepo: SyncRepository;
  private readonly roomsRepo: RoomsRepository;
  private readonly contactsRepo: ContactsRepository;
  private readonly messagesRepo: MessagesRepository;

  constructor(
    syncApi: SyncApi,
    syncRepo: SyncRepository,
    roomsRepo: RoomsRepository,
    contactsRepo: ContactsRepository,
    messagesRepo: MessagesRepository,
  ) {
    this.syncApi = syncApi;
    this.syncRepo = syncRepo;
    this.roomsRepo = roomsRepo;
    this.contactsRepo = contactsRepo;
    this.messagesRepo = messagesRepo;
  }

  async execute({
    auth,
  }: {
    auth: Extract<Auth, { authStatus: "authenticated" }>;
  }): Promise<ServiceResult<null>> {
    try {
      const context = await this.syncRepo.getSyncContext();

      // Only wipe local data when switching to a different user - the same
      // user re-syncing (e.g. every login) should never lose their cache.
      if (context && context.userId !== auth.user.id) {
        await this.syncRepo.dropDatabase();
      }

      // Always a full sync - the server's delta support (via `since`) is
      // unused on purpose, so there's no local timestamp to thread through.
      const syncResponse = await this.syncApi.fetchSyncData({});

      if (!syncResponse.success || !syncResponse.data) {
        return {
          success: false,
          message: "Sync failed",
          data: null,
        };
      }

      await this.roomsRepo.sync({
        rooms: syncResponse.data.rooms.map(({ room, unread }) => ({
          room: room.toDTO(),
          unread,
        })),
      });
      await this.contactsRepo.sync(syncResponse.data.contacts.toDTO());
      await this.messagesRepo.sync(
        syncResponse.data.messages.map((message) => message.toDTO()),
      );
      await this.syncRepo.saveSyncContext(
        SyncContext.hydrate({
          userId: auth.user.id,
          lastSyncedAt: syncResponse.data.lastSync,
        }),
      );

      return {
        success: true,
        message: "Sync successful",
        data: null,
      };
    } catch (error) {
      console.error("[SyncService] real error:", error);

      if (
        error instanceof DomainError ||
        error instanceof RepoError ||
        error instanceof HttpError
      ) {
        return { success: false, message: error.message, data: null };
      }

      return {
        success: false,
        message: "An unexpected error occurred",
        data: null,
      };
    }
  }
}
