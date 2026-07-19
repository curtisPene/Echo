import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { verifyUserIdService } from "../../../../composition";
import { registerAndLogin, cleanupUser } from "../testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("VerifyUserIdService", () => {
  it("returns true for a real, existing user id", async () => {
    const user = await registerAndLogin("A");

    const exists = await verifyUserIdService.execute({ userId: user.id });
    expect(exists).toBe(true);

    await cleanupUser(user);
  });

  it("returns false for an id that doesn't correspond to a real user", async () => {
    const exists = await verifyUserIdService.execute({ userId: "507f1f77bcf86cd799439011" });
    expect(exists).toBe(false);
  });
});
