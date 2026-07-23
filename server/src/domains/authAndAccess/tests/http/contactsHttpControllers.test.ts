import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createServer } from "node:http";
import { createApp } from "../../../../app";
import { mongooseConnect } from "../../../../server";
import { attachSocket } from "../../../../socket";
import * as composition from "../../../../composition";
import { registerAndLogin, cleanupUser, PASSWORD } from "../testHelpers";
import type {
  SearchContactsRequest,
  AddContactRequest,
  BlockContactRequest,
} from "../../types/contactsTypes";
import mongoose from "mongoose";

const app = createApp(composition);

beforeAll(async () => {
  await mongooseConnect();

  // AddContactService/BlockContactService use the real
  // SocketIOAuthAndAccessSocket, which reaches into socket.ts's
  // module-level `io` - never assigned unless attachSocket() has run. No
  // client needs to actually connect; io just needs to exist so
  // io.to(...)/io.in(...) don't throw against undefined.
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
  const login = await composition.loginService.execute({
    email,
    password: PASSWORD,
  });
  if (!login.success) throw new Error("unreachable");
  return login.data.accessToken;
}

describe("POST /contacts/search", () => {
  it("returns 201 with the found user for a real email", async () => {
    const viewer = await registerAndLogin("Viewer");
    const target = await registerAndLogin("Target");
    const viewerToken = await accessTokenFor(viewer.email);

    const response = await request(app)
      .post("/contacts/search")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({ email: target.email } as SearchContactsRequest);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(target.id);

    await cleanupUser(viewer);
    await cleanupUser(target);
  });

  it("returns 401 with no access token", async () => {
    const response = await request(app)
      .post("/contacts/search")
      .send({ email: "nobody@example.com" } as SearchContactsRequest);

    expect(response.status).toBe(401);
  });

  it("returns 400 for a malformed body", async () => {
    const viewer = await registerAndLogin("Viewer");
    const viewerToken = await accessTokenFor(viewer.email);

    const response = await request(app)
      .post("/contacts/search")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({});

    expect(response.status).toBe(400);

    await cleanupUser(viewer);
  });
});

describe("POST /contacts/add", () => {
  it("returns 201 and adds the contact", async () => {
    const adder = await registerAndLogin("Adder");
    const added = await registerAndLogin("Added");
    const adderToken = await accessTokenFor(adder.email);

    const response = await request(app)
      .post("/contacts/add")
      .set("Authorization", `Bearer ${adderToken}`)
      .send({ userId: added.id } as AddContactRequest);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.addedUser.userId).toBe(added.id);
    expect(response.body.data.room).toBeDefined();
    // This is a gap, I need to make zod schemas for dtos to use for
    // assetions in testing

    await cleanupUser(adder);
    await cleanupUser(added);
  });

  it("returns 400 for a malformed body", async () => {
    const adder = await registerAndLogin("Adder");
    const adderToken = await accessTokenFor(adder.email);

    const response = await request(app)
      .post("/contacts/add")
      .set("Authorization", `Bearer ${adderToken}`)
      .send({});

    expect(response.status).toBe(400);

    await cleanupUser(adder);
  });

  it("returns 401 with no access token", async () => {
    const response = await request(app)
      .post("/contacts/add")
      .send({
        userId: new mongoose.Types.ObjectId().toString(),
      } as AddContactRequest);

    expect(response.status).toBe(401);
  });
});

describe("POST /contacts/block", () => {
  it("returns 201 and blocks the contact", async () => {
    const blocker = await registerAndLogin("Blocker");
    const target = await registerAndLogin("Target");
    const blockerToken = await accessTokenFor(blocker.email);

    const response = await request(app)
      .post("/contacts/block")
      .set("Authorization", `Bearer ${blockerToken}`)
      .send({ userId: target.id } as BlockContactRequest);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.blockedContactId).toBe(target.id);

    await cleanupUser(blocker);
    await cleanupUser(target);
  });

  it("returns 400 for a malformed body", async () => {
    const blocker = await registerAndLogin("Blocker");
    const blockerToken = await accessTokenFor(blocker.email);

    const response = await request(app)
      .post("/contacts/block")
      .set("Authorization", `Bearer ${blockerToken}`)
      .send({});

    expect(response.status).toBe(400);

    await cleanupUser(blocker);
  });

  it("returns 401 with no access token", async () => {
    const response = await request(app)
      .post("/contacts/block")
      .send({
        userId: new mongoose.Types.ObjectId().toString(),
      } as BlockContactRequest);

    expect(response.status).toBe(401);
  });
});
