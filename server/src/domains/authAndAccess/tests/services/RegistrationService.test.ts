import "dotenv/config";
import { beforeAll, afterAll, afterEach, describe, expect, it } from "vitest";
import { registrationService } from "../../../../composition";
import { userRepo } from "../../repo/UserRepo";
import { cleanupUser } from "../testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const uniqueEmail = () =>
  `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const VALID_PASSWORD = "Password1!";

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("RegistrationService", () => {
  const createdEmails: string[] = [];

  afterEach(async () => {
    while (createdEmails.length) {
      const email = createdEmails.pop();
      if (!email) continue;

      const user = await userRepo.findByEmail({ email });
      if (!user) continue;

      await cleanupUser(user);
    }
  });

  it("registers a new user with valid input", async () => {
    const email = uniqueEmail();
    createdEmails.push(email);

    const result = await registrationService.execute({
      firstName: "Ada",
      lastName: "Lovelace",
      email,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();

    const created = await userRepo.findByEmail({ email });
    expect(created).not.toBeNull();
    expect(created?.firstName).toBe("Ada");
  });

  it("rejects mismatched password/confirmPassword with reason 'validation'", async () => {
    const email = uniqueEmail();

    const result = await registrationService.execute({
      firstName: "Ada",
      lastName: "Lovelace",
      email,
      password: VALID_PASSWORD,
      confirmPassword: "SomethingElse1!",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.data.reason).toBe("validation");

    const created = await userRepo.findByEmail({ email });
    expect(created).toBeNull();
  });

  it("rejects a duplicate email with reason 'duplicate_email'", async () => {
    const email = uniqueEmail();
    createdEmails.push(email);

    const first = await registrationService.execute({
      firstName: "Ada",
      lastName: "Lovelace",
      email,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });
    expect(first.success).toBe(true);

    const second = await registrationService.execute({
      firstName: "Someone",
      lastName: "Else",
      email,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(second.success).toBe(false);
    if (second.success) return;
    expect(second.data.reason).toBe("duplicate_email");
  });
});
