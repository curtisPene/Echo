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
  it("returns an empty contacts/blocked list for a user with neither", async () => {
    const a = await registerAndLogin("A");

    const result = await getUsersContactsService.execute({ userId: a.id });

    expect(result.contacts).toEqual([]);
    expect(result.blocked).toEqual([]);

    await cleanupUser(a);
  });
});
