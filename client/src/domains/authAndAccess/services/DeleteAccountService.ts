import type { ServiceResult } from "@/types";
import type { AuthApi } from "../ports/AuthApi";
import type { SyncRepository } from "@/domains/sync/ports/SyncRepository";

export class DeleteAccountService {
  private readonly authApi: AuthApi;
  private readonly syncRepo: SyncRepository;

  constructor(authApi: AuthApi, syncRepo: SyncRepository) {
    this.authApi = authApi;
    this.syncRepo = syncRepo;
  }

  async execute(): Promise<ServiceResult<null>> {
    const result = await this.authApi.deleteAccount();

    if (result.success) {
      await this.syncRepo.dropDatabase();
    }

    return result;
  }
}
