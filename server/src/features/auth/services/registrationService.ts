import { ServiceResult } from "../../../types";
import { createContacts } from "../../contacts/repo/mongooseContactsRepo";
import { createUser } from "../../users/repo/mongooseUserRepo";
import { hashPassword } from "../adapters/bcryptAdapter";
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
    const hashedPassword = await hashPassword(password);
    const userResult = await createUser({
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
      userId: userResult.user._id.toString(),
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
