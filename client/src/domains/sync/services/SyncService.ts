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
      let context = await this.syncRepo.getSyncContext();

      if (!context || context.userId !== auth.user.id) {
        if (context) await this.syncRepo.dropDatabase();
        context = SyncContext.hydrate({
          userId: auth.user.id,
          lastSyncedAt: null,
        });
      }

      const syncResponse = await this.syncApi.fetchSyncData({
        since: context.lastSyncedAt ?? undefined,
      });

      if (!syncResponse.success) {
        return {
          success: false,
          message: "Sync failed",
          data: null,
        };
      }

      await this.roomsRepo.sync({ rooms: syncResponse.data.rooms });
      await this.contactsRepo.sync(syncResponse.data.contacts);
      await this.messagesRepo.sync(syncResponse.data.messages);
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
