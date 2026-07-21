import type { LoginAPIResult } from "../adapters/HttpAuthApi";
import type { AuthApi } from "../ports/AuthApi";

export class VerificationService {
  private readonly authApi: AuthApi;

  constructor(authApi: AuthApi) {
    this.authApi = authApi;
  }

  async execute(): Promise<LoginAPIResult> {
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
  }
}
