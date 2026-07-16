import { ServiceResult } from "../../../types";
import { createContacts } from "../../conversations/repo/mongooseContactsRepo";
import { userRepo } from "../repo/mongooseUserRepo";
import { passwordHasherAdapter } from "../adapters/passwordHasherAdapter";
import { UserRegistrationDto } from "../types";

export type RegisterUserFailureReason =
  | "duplicate_email"
  | "validation"
  | "unknown";

export type RegisterUserOutput = ServiceResult<
  null,
  { reason: RegisterUserFailureReason }
>;

const FAILURE_MESSAGES: Record<RegisterUserFailureReason, string> = {
  duplicate_email: "An account with that email already exists",
  validation: "Invalid input",
  unknown: "Could not create user",
};

export async function registrationService({
  firstName,
  lastName,
  email,
  password,
}: UserRegistrationDto): Promise<RegisterUserOutput> {
  try {
    const hashedPassword = await passwordHasherAdapter.hash(password);
    const userResult = await userRepo.createUser({
      user: { firstName, lastName, email, password: hashedPassword },
    });

    if (!userResult.success) {
      return {
        success: false,
        message: FAILURE_MESSAGES[userResult.reason],
        data: { reason: userResult.reason },
      };
    }

    await createContacts({
      userId: userResult.user.id,
    });

    return {
      success: true,
      message: "User registered successfully",
      data: null,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Internal server error",
      data: { reason: "unknown" },
    };
  }
}
