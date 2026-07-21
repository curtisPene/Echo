import { describe, expect, it } from "vitest";
import { AuthControllers } from "../../controllers/AuthControllers";
import { LoginService } from "../../services/LoginService";
import { RegistrationService } from "../../services/RegistrationService";
import type { AuthApi } from "../../ports/AuthApi";

const VALID_PASSWORD = "Password1!";

function createFakeAuthApi(overrides: Partial<AuthApi> = {}): AuthApi {
  return {
    async login() {
      throw new Error("not used in this test");
    },
    async register() {
      return { success: true, message: "Registered successfully", data: null };
    },
    async verifyRefreshToken() {
      throw new Error("not used in this test");
    },
    ...overrides,
  };
}

function createAuthControllers(authApi: AuthApi) {
  return new AuthControllers(
    new LoginService(authApi),
    new RegistrationService(authApi),
  );
}

describe("AuthControllers.register", () => {
  it("rejects a weak password before it ever reaches the server", async () => {
    const fakeAuthApi = createFakeAuthApi({
      register: async () => {
        throw new Error(
          "client-side validation should reject before this is ever called",
        );
      },
    });
    const authControllers = createAuthControllers(fakeAuthApi);

    const result = await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "weak",
      confirmPassword: "weak",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched password/confirmPassword before it ever reaches the server", async () => {
    const fakeAuthApi = createFakeAuthApi({
      register: async () => {
        throw new Error(
          "client-side validation should reject before this is ever called",
        );
      },
    });
    const authControllers = createAuthControllers(fakeAuthApi);

    const result = await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: VALID_PASSWORD,
      confirmPassword: "Different1!",
    });

    expect(result.success).toBe(false);
  });

  it("succeeds when the api reports success", async () => {
    const authControllers = createAuthControllers(createFakeAuthApi());

    const result = await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result).toEqual({ success: true });
  });

  it("surfaces the api's failure message when the server rejects a duplicate email", async () => {
    const fakeAuthApi = createFakeAuthApi({
      register: async () => ({
        success: false,
        message: "Email already registered",
        data: { reason: "duplicate_email" },
      }),
    });
    const authControllers = createAuthControllers(fakeAuthApi);

    const result = await authControllers.register({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result).toEqual({
      success: false,
      message: "Email already registered",
    });
  });
});
