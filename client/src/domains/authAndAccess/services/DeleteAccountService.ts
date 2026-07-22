import type { ServiceResult } from "@/types";
import type { AuthApi } from "../ports/AuthApi";
import type { SyncRepository } from "@/domains/sync/ports/SyncRepository";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class DeleteAccountService {
  private readonly authApi: AuthApi;
  private readonly syncRepo: SyncRepository;

  constructor(authApi: AuthApi, syncRepo: SyncRepository) {
    this.authApi = authApi;
    this.syncRepo = syncRepo;
  }

  async execute(): Promise<ServiceResult<null>> {
    try {
      const result = await this.authApi.deleteAccount();

      if (result.success) {
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
