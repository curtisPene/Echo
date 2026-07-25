import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createServer } from "node:http";
import { createApp } from "../../../../app";
import { mongooseConnect } from "../../../../server";
import { attachSocket } from "../../../../socket";
import { userRepo } from "../../repo/UserRepo";
import * as composition from "../../../../composition";
import {
  registerAndLogin,
  cleanupUser,
  PASSWORD,
  createFakePresenceRepo,
  createFakeSocket,
} from "../testHelpers";
import { UserConnectedService } from "../../../presence/services/UserConnectedService";
import { UserDisconnectedService } from "../../../presence/services/UserDisconnectedService";
import mongoose from "mongoose";
import { NewAuthUserInput } from "../../domainModels/authUser";

const uniqueEmail = () =>
  `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const VALID_PASSWORD = "Password1!";

const app = createApp(composition);

beforeAll(async () => {
  await mongooseConnect();

  // DeleteUserAccountService uses the real SocketIOAuthAndAccessSocket,
  // which reaches into socket.ts's module-level `io` - never assigned
  // unless attachSocket() has run. No client needs to actually connect;
  // io just needs to exist so io.to(...)/io.in(...) don't throw against
  // undefined.
  const { socket: fakeAuthAndAccessSocket } = createFakeSocket();
  const { repo: fakePresenceRepo } = createFakePresenceRepo();
  attachSocket(
    createServer(),
    composition.verifyAccessTokenService,
    composition.addUserToRoomsService,
    composition.messagingControllers,
    composition.authAndAccessSocketControllers,
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

async function cleanup(email: string) {
  const user = await userRepo.findByEmail({ email });
  if (!user) return;

  await cleanupUser(user);
}

async function accessTokenFor(email: string) {
  const login = await composition.loginService.execute({ email, password: PASSWORD });
  if (!login.success) throw new Error("unreachable");
  return login.data.accessToken;
}

describe("POST /auth/register", () => {
  it("returns 201 with a well-formed success body for valid input", async () => {
    const email = uniqueEmail();

    const response = await request(app)
      .post("/auth/register")
      .send({
        firstName: "Ada",
        lastName: "Lovelace",
        email,
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
      } as NewAuthUserInput);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: expect.any(String),
      data: null,
    });

    await cleanup(email);
  });

  it("returns 400 with a body matching registrationResponseSchema's failure shape for malformed input", async () => {
    const response = await request(app).post("/auth/register").send({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "not-an-email",
      password: "weak",
      confirmPassword: "weak",
    });

    expect(response.status).toBe(400);
    // registrationResponseSchema (client) expects data: { reason: "duplicate_email" | "validation" | "unknown" }
    // on failure - not { errors: [...] }.
    expect(response.body.data).toEqual({ reason: "validation" });
  });

  it("returns 409 with reason 'duplicate_email' for a repeat email", async () => {
    const email = uniqueEmail();

    const first = await request(app)
      .post("/auth/register")
      .send({
        firstName: "Ada",
        lastName: "Lovelace",
        email,
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
      } as NewAuthUserInput);
    expect(first.status).toBe(201);

    const second = await request(app).post("/auth/register").send({
      firstName: "Someone",
      lastName: "Else",
      email,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(second.status).toBe(409);
    expect(second.body.data).toEqual({ reason: "duplicate_email" });

    await cleanup(email);
  });
});

describe("POST /auth/login", () => {
  it("returns 201 for valid credentials", async () => {
    const email = uniqueEmail();

    const registered = await request(app)
      .post("/auth/register")
      .send({
        firstName: "Ada",
        lastName: "Lovelace",
        email,
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
      } as NewAuthUserInput);
    expect(registered.status).toBe(201);

    const response = await request(app).post("/auth/login").send({
      email,
      password: VALID_PASSWORD,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toEqual(expect.any(String));

    await cleanup(email);
  });

  it("returns 404 for a wrong password", async () => {
    const email = uniqueEmail();

    const registered = await request(app)
      .post("/auth/register")
      .send({
        firstName: "Ada",
        lastName: "Lovelace",
        email,
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
      } as NewAuthUserInput);
    expect(registered.status).toBe(201);

    const response = await request(app).post("/auth/login").send({
      email,
      password: "wrong-password",
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);

    await cleanup(email);
  });
});

describe("POST /auth/delete-account", () => {
  it("returns 200 and deletes the account", async () => {
    const user = await registerAndLogin("ToDelete");
    const token = await accessTokenFor(user.email);

    const response = await request(app)
      .post("/auth/delete-account")
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
    const response = await request(app).post("/auth/delete-account");

    expect(response.status).toBe(401);
  });
});
