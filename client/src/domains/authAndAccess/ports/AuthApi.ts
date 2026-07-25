import type { LoginArgs } from "../services/LoginService";
import type { RegistrationServiceArgs } from "../services/RegistrationService";
import type { LoginAPIResult } from "../adapters/HttpAuthApi";
import type { ServiceResult } from "@/types";

export interface AuthApi {
  login(loginData: LoginArgs): Promise<LoginAPIResult>;

  register(
    registrationData: RegistrationServiceArgs,
  ): Promise<
    ServiceResult<
      null,
      { reason: "unknown" | "duplicate_email" | "validation" }
    >
  >;

  verifyRefreshToken(): Promise<LoginAPIResult>;

  logout(): Promise<ServiceResult<null>>;

  deleteAccount(): Promise<ServiceResult<null>>;
}
