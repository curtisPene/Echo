import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { loginService, verifyRefreshTokenService } from "../../../../composition";
import { registerAndLogin, cleanupUser, PASSWORD } from "../testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("VerifyRefreshTokenService", () => {
  it("issues a fresh access token for a valid refresh token", async () => {
    const user = await registerAndLogin("A");

    const login = await loginService.execute({ email: user.email, password: PASSWORD });
    expect(login.success).toBe(true);
    if (!login.success) return;

    const result = await verifyRefreshTokenService.execute({
      refreshToken: login.data.refreshToken,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) return;

    expect(result.data.user.email).toBe(user.email);
    expect(typeof result.data.accessToken).toBe("string");
    expect(result.data.accessToken.length).toBeGreaterThan(0);

    await cleanupUser(user);
  });

  it("rejects a garbage refresh token", async () => {
    const result = await verifyRefreshTokenService.execute({
      refreshToken: "not-a-real-token",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an access token presented as a refresh token", async () => {
    const user = await registerAndLogin("A");

    const login = await loginService.execute({ email: user.email, password: PASSWORD });
    expect(login.success).toBe(true);
    if (!login.success) return;

    const result = await verifyRefreshTokenService.execute({
      refreshToken: login.data.accessToken,
    });

    expect(result.success).toBe(false);

    await cleanupUser(user);
  });
});
