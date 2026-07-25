import type { ServiceResult } from "@/types";
import type { AuthApi } from "../ports/AuthApi";
import type { AuthSocketApi } from "../ports/AuthSocketApi";
import type { SyncRepository } from "@/domains/sync/ports/SyncRepository";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class LogoutService {
  private readonly authApi: AuthApi;
  private readonly authSocketApi: AuthSocketApi;
  private readonly syncRepo: SyncRepository;

  constructor(
    authApi: AuthApi,
    authSocketApi: AuthSocketApi,
    syncRepo: SyncRepository,
  ) {
    this.authApi = authApi;
    this.authSocketApi = authSocketApi;
    this.syncRepo = syncRepo;
  }

  async execute(): Promise<ServiceResult<null>> {
    try {
      const result = await this.authApi.logout();

      if (result.success) {
        // Ends this device's socket connection specifically - not every
        // device the user is logged in on - then drops the local cache once
        // the socket has actually confirmed disconnecting.
        await this.authSocketApi.logout();
        await this.syncRepo.dropDatabase();
      }

      return result;
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
