import { ServiceResult } from "../../../types";
import { contactsRepo } from "../repo/ContactsRepo";
import { userRepo } from "../repo/UserRepo";
import { PasswordHasher } from "../ports/PasswordHasher";
import { UserRegistrationDto } from "../types/authTypes";

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

export class RegistrationService {
  constructor(private readonly passwordHasher: PasswordHasher) {}

  async execute({
    firstName,
    lastName,
    email,
    password,
  }: UserRegistrationDto): Promise<RegisterUserOutput> {
    try {
      const hashedPassword = await this.passwordHasher.hash(password);
      const userResult = await userRepo.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      if (!userResult.success) {
        return {
          success: false,
          message: FAILURE_MESSAGES[userResult.reason],
          data: { reason: userResult.reason },
        };
      }

      await contactsRepo.create({ userId: userResult.user.id });

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
}
