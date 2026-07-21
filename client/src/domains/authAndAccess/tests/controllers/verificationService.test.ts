import { describe, expect, it } from "vitest";
import { VerificationService } from "../../services/VerificationService";
import { User } from "../../entities/user";
import type { AuthApi } from "../../ports/AuthApi";

function createFakeAuthApi(overrides: Partial<AuthApi> = {}): AuthApi {
  return {
    async login() {
      throw new Error("not used in this test");
    },
    async register() {
      throw new Error("not used in this test");
    },
    async verifyRefreshToken() {
      throw new Error("not used in this test");
    },
    async deleteAccount() {
      throw new Error("not used in this test");
    },
    ...overrides,
  };
}

describe("VerificationService", () => {
  it("returns the fresh access token and user when the api verifies successfully", async () => {
    const fakeAuthApi = createFakeAuthApi({
      verifyRefreshToken: async () => ({
        success: true,
        message: "Authorized",
        data: {
          accessToken: "fake-access-token",
          user: User.hydrate({
            id: "user-1",
            firstName: "Alan",
            lastName: "Turing",
            email: "alan@example.com",
          }),
        },
      }),
    });
    const verificationService = new VerificationService(fakeAuthApi);

    const result = await verificationService.execute();

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    expect(result.data.accessToken).toBe("fake-access-token");
    expect(result.data.user.email).toBe("alan@example.com");
  });

  it("returns Unauthorized when the api reports failure", async () => {
    const fakeAuthApi = createFakeAuthApi({
      verifyRefreshToken: async () => ({
        success: false,
        message: "Token verification failed",
        data: null,
      }),
    });
    const verificationService = new VerificationService(fakeAuthApi);

    const result = await verificationService.execute();

    expect(result).toEqual({
      success: false,
      message: "Unauthorized",
      data: null,
    });
  });
});
