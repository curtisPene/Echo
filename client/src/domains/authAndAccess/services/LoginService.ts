import type { LoginAPIResult } from "../adapters/HttpAuthApi";
import type { AuthApi } from "../ports/AuthApi";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export type LoginArgs = {
  email: string;
  password: string;
};

export class LoginService {
  private readonly authApi: AuthApi;

  constructor(authApi: AuthApi) {
    this.authApi = authApi;
  }

  async execute({ email, password }: LoginArgs): Promise<LoginAPIResult> {
    try {
      const result = await this.authApi.login({ email, password });

      if (!result.success || !result.data) {
        return {
          success: false as const,
          message: "Invalid credentials",
          data: null,
        };
      }

      return {
        success: true as const,
        message: "Authorized",
        data: {
          accessToken: result.data.accessToken,
          user: result.data.user,
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
