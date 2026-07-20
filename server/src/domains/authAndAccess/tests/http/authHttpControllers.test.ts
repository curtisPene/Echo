import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../../../app";
import { mongooseConnect } from "../../../../server";
import { userRepo } from "../../repo/UserRepo";
import * as composition from "../../../../composition";
import { cleanupUser } from "../testHelpers";
import mongoose from "mongoose";
import { NewAuthUserInput } from "../../domainModels/authUser";

const uniqueEmail = () =>
  `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const VALID_PASSWORD = "Password1!";

const app = createApp(composition);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

async function cleanup(email: string) {
  const user = await userRepo.findByEmail({ email });
  if (!user) return;

  await cleanupUser(user);
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
