import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createServer } from "node:http";
import { createApp } from "../../../../app";
import { mongooseConnect } from "../../../../server";
import { attachSocket } from "../../../../socket";
import * as composition from "../../../../composition";
import {
  registerAndLogin,
  cleanupUser,
  PASSWORD,
  createFakePresenceRepo,
  createFakeSocket,
} from "../../../authAndAccess/tests/testHelpers";
import { UserConnectedService } from "../../../presence/services/UserConnectedService";
import { UserDisconnectedService } from "../../../presence/services/UserDisconnectedService";
import mongoose from "mongoose";

const app = createApp(composition);

beforeAll(async () => {
  await mongooseConnect();

  const { socket: fakeAuthAndAccessSocket } = createFakeSocket();
  const { repo: fakePresenceRepo } = createFakePresenceRepo();
  attachSocket(
    createServer(),
    composition.verifyAccessTokenService,
    composition.addUserToRoomsService,
    composition.messagingControllers,
    new UserConnectedService(
      fakePresenceRepo,
      fakeAuthAndAccessSocket,
      composition.getUsersContactsService,
    ),
    new UserDisconnectedService(
      fakePresenceRepo,
      fakeAuthAndAccessSocket,
      composition.getUsersContactsService,
    ),
  );
});

afterAll(async () => {
  await mongoose.disconnect();
});

async function accessTokenFor(email: string) {
  const login = await composition.loginService.execute({
    email,
    password: PASSWORD,
  });
  if (!login.success) throw new Error("unreachable");
  return login.data.accessToken;
}

describe("GET /sync/user", () => {
  it("returns 200 with a full bootstrap payload when 'since' is omitted", async () => {
    const user = await registerAndLogin("Sync");
    const token = await accessTokenFor(user.email);

    const response = await request(app)
      .get("/sync/user")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("contacts");
    expect(response.body.data).toHaveProperty("rooms");

    await cleanupUser(user);
  });

  it("returns 200 for a valid 'since' ISO timestamp (delta sync)", async () => {
    const user = await registerAndLogin("Sync");
    const token = await accessTokenFor(user.email);

    const response = await request(app)
      .get("/sync/user")
      .query({ since: new Date().toISOString() })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    await cleanupUser(user);
  });

  it("returns 400 for a malformed 'since' value", async () => {
    const user = await registerAndLogin("Sync");
    const token = await accessTokenFor(user.email);

    const response = await request(app)
      .get("/sync/user")
      .query({ since: "not-a-date" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);

    await cleanupUser(user);
  });

  it("returns 401 with no access token", async () => {
    const response = await request(app).get("/sync/user");

    expect(response.status).toBe(401);
  });
});
