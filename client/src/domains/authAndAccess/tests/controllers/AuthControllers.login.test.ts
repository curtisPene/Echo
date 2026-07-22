import { describe, expect, it, beforeEach } from "vitest";
import { AuthControllers } from "../../controllers/AuthControllers";
import { LoginService } from "../../services/LoginService";
import { RegistrationService } from "../../services/RegistrationService";
import { VerificationService } from "../../services/VerificationService";
import { DeleteAccountService } from "../../services/DeleteAccountService";
import { User } from "../../entities/user";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";
import type { AuthApi } from "../../ports/AuthApi";
import type { SyncRepository } from "@/domains/sync/ports/SyncRepository";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";

function createFakeNotificationsPort(): NotificationsPort {
  return { notify: () => {} };
}

function createFakeSyncRepo(): SyncRepository {
  return {
    async getSyncContext() {
      return undefined;
    },
    async saveSyncContext() {},
    async dropDatabase() {},
  };
}

const DEV_USER = { email: "alan@example.com", password: "password123" };

function createFakeAuthApi(): AuthApi {
  return {
    async login({ email, password }) {
      if (email !== DEV_USER.email || password !== DEV_USER.password) {
        return { success: false, message: "Invalid credentials", data: null };
      }

      return {
        success: true,
        message: "Authorized",
        data: {
          accessToken: "fake-access-token",
          user: User.hydrate({
            id: "user-1",
            firstName: "Alan",
            lastName: "Turing",
            email: DEV_USER.email,
          }),
        },
      };
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
  };
}

let authControllers: AuthControllers;

beforeEach(() => {
  useAuth.setState({ authStatus: "unverified", user: null });
  useAppStatus.setState({ appStatus: "idle" });

  const fakeAuthApi = createFakeAuthApi();
  authControllers = new AuthControllers(
    new LoginService(fakeAuthApi),
    new RegistrationService(fakeAuthApi),
    new VerificationService(fakeAuthApi),
    new DeleteAccountService(fakeAuthApi, createFakeSyncRepo()),
    createFakeNotificationsPort(),
  );
});

describe("AuthControllers.login", () => {
  it("authenticates with valid credentials and populates the auth store", async () => {
    const result = await authControllers.login(DEV_USER);

    expect(result).toEqual({ success: true });

    const auth = useAuth.getState();

    if (auth.authStatus !== "authenticated") {
      throw new Error("Expected auth to be authenticated");
    }

    expect(auth.user.email).toBe(DEV_USER.email);
    expect(typeof auth.accessToken).toBe("string");
    expect(auth.accessToken).not.toHaveLength(0);
  });

  it("moves app status to syncing after a successful login", async () => {
    await authControllers.login(DEV_USER);

    expect(useAppStatus.getState().appStatus).toBe("syncing");
  });

  it("rejects an invalid password without touching the auth store", async () => {
    const result = await authControllers.login({
      email: DEV_USER.email,
      password: "wrong-password",
    });

    expect(result.success).toBe(false);
    expect(useAuth.getState().authStatus).toBe("unverified");
    expect(useAppStatus.getState().appStatus).toBe("idle");
  });

  it("rejects an unknown email", async () => {
    const result = await authControllers.login({
      email: "no-such-user@example.com",
      password: "whatever123",
    });

    expect(result.success).toBe(false);
  });
});
