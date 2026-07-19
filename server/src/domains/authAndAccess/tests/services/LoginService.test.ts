import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { loginService } from "../../../../composition";
import { registerAndLogin, cleanupUser, PASSWORD } from "../testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("LoginService", () => {
  it("succeeds with correct credentials and returns a user plus both tokens", async () => {
    const user = await registerAndLogin("A");

    const result = await loginService.execute({ email: user.email, password: PASSWORD });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.user.email).toBe(user.email);
    expect(typeof result.data.accessToken).toBe("string");
    expect(typeof result.data.refreshToken).toBe("string");
    expect(result.data.accessToken).not.toBe(result.data.refreshToken);

    await cleanupUser(user);
  });

  it("fails with 'Invalid credentials' for a wrong password", async () => {
    const user = await registerAndLogin("A");

    const result = await loginService.execute({
      email: user.email,
      password: "wrong-password",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid credentials");

    await cleanupUser(user);
  });

  it("fails with 'Invalid credentials' for an unknown email", async () => {
    const result = await loginService.execute({
      email: "no-such-user@example.com",
      password: "whatever123",
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid credentials");
  });
});
