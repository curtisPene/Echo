import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { getUsersContactsService } from "../../../../composition";
import { registerAndLogin, cleanupUser } from "../testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("GetUsersContactsService", () => {
  it("returns an empty blockedIds list for a user who hasn't blocked anyone", async () => {
    const a = await registerAndLogin("A");

    const result = await getUsersContactsService.execute({ userId: a.id });

    expect(result.blockedIds).toEqual([]);

    await cleanupUser(a);
  });
});
