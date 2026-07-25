import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { findUserIdentitiesService } from "../../../../composition";
import { registerAndLogin, cleanupUser } from "../testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("FindUserIdentitiesService", () => {
  it("resolves identities for a batch of real user ids", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");

    const identities = await findUserIdentitiesService.execute({
      userIds: [a.id, b.id],
    });

    expect(identities).toHaveLength(2);

    const identityA = identities.find((identity) => identity.id === a.id);
    const identityB = identities.find((identity) => identity.id === b.id);

    expect(identityA).toEqual({
      id: a.id,
      firstName: "A",
      lastName: "Demo",
      email: a.email,
    });
    expect(identityB).toEqual({
      id: b.id,
      firstName: "B",
      lastName: "Demo",
      email: b.email,
    });

    await cleanupUser(a);
    await cleanupUser(b);
  });

  it("silently omits ids that don't correspond to a real user", async () => {
    const identities = await findUserIdentitiesService.execute({
      userIds: ["507f1f77bcf86cd799439011"],
    });

    expect(identities).toHaveLength(0);
  });
});
