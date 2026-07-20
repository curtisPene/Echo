import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createServer } from "node:http";
import { createApp } from "../../../../app";
import { mongooseConnect } from "../../../../server";
import { attachSocket } from "../../../../socket";
import * as composition from "../../../../composition";
import { registerAndLogin, cleanupUser, PASSWORD } from "../../../authAndAccess/tests/testHelpers";
import type { CreateNewRoomRequest, AcceptRoomInviteRequest } from "../../types/roomsTypes";
import mongoose from "mongoose";

const app = createApp(composition);

beforeAll(async () => {
  await mongooseConnect();

  // AcceptRoomInviteService uses the real SocketIOAuthAndAccessSocket,
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

describe("POST /rooms", () => {
  it("returns 201 and creates a room", async () => {
    const creator = await registerAndLogin("Creator");
    const invitee = await registerAndLogin("Invitee");
    const creatorToken = await accessTokenFor(creator.email);

    const response = await request(app)
      .post("/rooms")
      .set("Authorization", `Bearer ${creatorToken}`)
      .send({
        name: "Creator, Invitee",
        participants: [{ id: invitee.id }],
      } as CreateNewRoomRequest);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Creator, Invitee");
    expect(response.body.data.participants).toHaveLength(2);

    await cleanupUser(creator);
    await cleanupUser(invitee);
  });

  it("returns 400 for a malformed body", async () => {
    const creator = await registerAndLogin("Creator");
    const creatorToken = await accessTokenFor(creator.email);

    const response = await request(app)
      .post("/rooms")
      .set("Authorization", `Bearer ${creatorToken}`)
      .send({ name: "", participants: [] });

    expect(response.status).toBe(400);

    await cleanupUser(creator);
  });

  it("returns 401 with no access token", async () => {
    const response = await request(app)
      .post("/rooms")
      .send({
        name: "Nobody",
        participants: [{ id: new mongoose.Types.ObjectId().toString() }],
      } as CreateNewRoomRequest);

    expect(response.status).toBe(401);
  });
});

describe("POST /rooms/accept-invite", () => {
  it("returns 201 and flips the invitee's status to accepted", async () => {
    const creator = await registerAndLogin("Creator");
    const invitee = await registerAndLogin("Invitee");
    const creatorToken = await accessTokenFor(creator.email);
    const inviteeToken = await accessTokenFor(invitee.email);

    const createResponse = await request(app)
      .post("/rooms")
      .set("Authorization", `Bearer ${creatorToken}`)
      .send({
        name: "Creator, Invitee",
        participants: [{ id: invitee.id }],
      } as CreateNewRoomRequest);
    expect(createResponse.status).toBe(201);

    const response = await request(app)
      .post("/rooms/accept-invite")
      .set("Authorization", `Bearer ${inviteeToken}`)
      .send({ roomId: createResponse.body.data.id } as AcceptRoomInviteRequest);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    const inviteeParticipant = response.body.data.participants.find(
      (p: { userId: string }) => p.userId === invitee.id,
    );
    expect(inviteeParticipant.status).toBe("accepted");

    await cleanupUser(creator);
    await cleanupUser(invitee);
  });

  it("returns 400 for a malformed body", async () => {
    const user = await registerAndLogin("Solo");
    const token = await accessTokenFor(user.email);

    const response = await request(app)
      .post("/rooms/accept-invite")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);

    await cleanupUser(user);
  });

  it("returns 404 for a nonexistent room id", async () => {
    const user = await registerAndLogin("Solo");
    const token = await accessTokenFor(user.email);

    const response = await request(app)
      .post("/rooms/accept-invite")
      .set("Authorization", `Bearer ${token}`)
      .send({ roomId: new mongoose.Types.ObjectId().toString() } as AcceptRoomInviteRequest);

    expect(response.status).toBe(404);

    await cleanupUser(user);
  });

  it("returns 401 with no access token", async () => {
    const response = await request(app)
      .post("/rooms/accept-invite")
      .send({ roomId: new mongoose.Types.ObjectId().toString() } as AcceptRoomInviteRequest);

    expect(response.status).toBe(401);
  });
});
