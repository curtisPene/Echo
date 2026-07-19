import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../../../app";
import { mongooseConnect } from "../../../../server";
import { userRepo } from "../../repo/UserRepo";
import { cleanupUser } from "../testHelpers";
import mongoose from "mongoose";

const app = createApp();
const VALID_PASSWORD = "Password1!";
const uniqueEmail = () =>
  `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("POST /auth/verify", () => {
  it("returns a fresh access token when the refreshToken cookie from login is presented", async () => {
    const email = uniqueEmail();
    const agent = request.agent(app);

    const registered = await agent.post("/auth/register").send({
      firstName: "Ada",
      lastName: "Lovelace",
      email,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });
    expect(registered.status).toBe(201);

    const login = await agent.post("/auth/login").send({ email, password: VALID_PASSWORD });
    expect(login.status).toBe(201);

    // The agent carries the httpOnly refreshToken cookie set on login
    // automatically on the next request - this is the actual mechanism
    // the browser relies on too (withCredentials on the client).
    const verify = await agent.post("/auth/verify");

    expect(verify.status).toBe(202);
    expect(verify.body.success).toBe(true);
    expect(verify.body.data.accessToken).toEqual(expect.any(String));

    const user = await userRepo.findByEmail({ email });
    if (user) await cleanupUser(user);
  });

  it("returns 401 with no refreshToken cookie at all", async () => {
    const response = await request(app).post("/auth/verify");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("returns 403 for a garbage refreshToken cookie", async () => {
    const response = await request(app)
      .post("/auth/verify")
      .set("Cookie", "refreshToken=not-a-real-token");

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
