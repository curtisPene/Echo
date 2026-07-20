import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createServer } from "node:http";
import { createApp } from "../../../../app";
import { mongooseConnect } from "../../../../server";
import { attachSocket } from "../../../../socket";
import * as composition from "../../../../composition";
import { registerAndLogin, cleanupUser, PASSWORD } from "../testHelpers";
import mongoose from "mongoose";

const app = createApp(composition);

beforeAll(async () => {
  await mongooseConnect();

  // DeleteUserAccountService uses the real SocketIOAuthAndAccessSocket,
  // which reaches into socket.ts's module-level `io` - never assigned
  // unless attachSocket() has run. No client needs to actually connect;
  // io just needs to exist so io.to(...)/io.in(...) don't throw against
  // undefined.
  attachSocket(
    createServer(),
    composition.verifyAccessTokenService,
    composition.addUserToRoomsService,
    composition.messagingControllers,
  );
});

afterAll(async () => {
  await mongoose.disconnect();
});

async function accessTokenFor(email: string) {
  const login = await composition.loginService.execute({ email, password: PASSWORD });
  if (!login.success) throw new Error("unreachable");
  return login.data.accessToken;
}

describe("GET /user/sync", () => {
  it("returns 200 with a full bootstrap payload when 'since' is omitted", async () => {
    const user = await registerAndLogin("Sync");
    const token = await accessTokenFor(user.email);

    const response = await request(app).get("/user/sync").set("Authorization", `Bearer ${token}`);

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
      .get("/user/sync")
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
      .get("/user/sync")
      .query({ since: "not-a-date" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);

    await cleanupUser(user);
  });

  it("returns 401 with no access token", async () => {
    const response = await request(app).get("/user/sync");

    expect(response.status).toBe(401);
  });
});

describe("POST /user/delete-account", () => {
  it("returns 200 and deletes the account", async () => {
    const user = await registerAndLogin("ToDelete");
    const token = await accessTokenFor(user.email);

    const response = await request(app)
      .post("/user/delete-account")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const stillExists = await composition.loginService.execute({
      email: user.email,
      password: PASSWORD,
    });
    expect(stillExists.success).toBe(false);
  });

  it("returns 401 with no access token", async () => {
    const response = await request(app).post("/user/delete-account");

    expect(response.status).toBe(401);
  });
});
