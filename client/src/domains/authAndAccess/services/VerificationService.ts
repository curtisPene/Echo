import type { LoginAPIResult } from "../adapters/HttpAuthApi";
import type { AuthApi } from "../ports/AuthApi";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class VerificationService {
  private readonly authApi: AuthApi;

  constructor(authApi: AuthApi) {
    this.authApi = authApi;
  }

  async execute(): Promise<LoginAPIResult> {
    try {
      const response = await this.authApi.verifyRefreshToken();

      if (!response.success || !response.data) {
        return {
          success: false,
          message: "Unauthorized",
          data: null,
        };
      }

      return {
        success: true,
        message: "Authorized",
        data: {
          accessToken: response.data.accessToken,
          user: response.data.user,
        },
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
