import type { LoginService, LoginArgs } from "../services/LoginService";
import type {
  RegistrationService,
  RegistrationServiceArgs,
} from "../services/RegistrationService";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";

export type LoginControllerResult =
  { success: true } | { success: false; message: string };

export type RegisterControllerResult =
  { success: true } | { success: false; message: string };

export class AuthControllers {
  private readonly loginService: LoginService;
  private readonly registrationService: RegistrationService;

  constructor(
    loginService: LoginService,
    registrationService: RegistrationService,
  ) {
    this.loginService = loginService;
    this.registrationService = registrationService;
  }

  login = async ({
    email,
    password,
  }: LoginArgs): Promise<LoginControllerResult> => {
    const result = await this.loginService.execute({ email, password });

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    useAuth.getState().setAuth({
      authStatus: "authenticated",
      user: result.data.user,
      accessToken: result.data.accessToken,
    });
    useAppStatus.getState().setAppStatus("syncing");

    return { success: true };
  };

  register = async ({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  }: RegistrationServiceArgs): Promise<RegisterControllerResult> => {
    const result = await this.registrationService.execute({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      return { success: false, message: result.message };
    }

    return { success: true };
  };
}
