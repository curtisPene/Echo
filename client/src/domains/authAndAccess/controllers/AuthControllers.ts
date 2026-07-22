import type { LoginService, LoginArgs } from "../services/LoginService";
import type {
  RegistrationService,
  RegistrationServiceArgs,
} from "../services/RegistrationService";
import type { VerificationService } from "../services/VerificationService";
import type { DeleteAccountService } from "../services/DeleteAccountService";
import { useAuth } from "@/stores/useAuth";
import { useAppStatus } from "@/stores/useAppStatus";
import type { ServiceResult } from "@/types";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";

export type LoginControllerResult =
  { success: true } | { success: false; message: string };

export type RegisterControllerResult =
  { success: true } | { success: false; message: string };

export class AuthControllers {
  private readonly loginService: LoginService;
  private readonly registrationService: RegistrationService;
  private readonly verificationService: VerificationService;
  private readonly deleteAccountService: DeleteAccountService;
  private readonly notificationsPort: NotificationsPort;

  constructor(
    loginService: LoginService,
    registrationService: RegistrationService,
    verificationService: VerificationService,
    deleteAccountService: DeleteAccountService,
    notificationsPort: NotificationsPort,
  ) {
    this.loginService = loginService;
    this.registrationService = registrationService;
    this.verificationService = verificationService;
    this.deleteAccountService = deleteAccountService;
    this.notificationsPort = notificationsPort;
  }

  login = async ({
    email,
    password,
  }: LoginArgs): Promise<LoginControllerResult> => {
    const result = await this.loginService.execute({ email, password });

    if (!result.success || !result.data) {
      this.notificationsPort.notify(result.message, "error");
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
      this.notificationsPort.notify(result.message, "error");
      return { success: false, message: result.message };
    }

    return { success: true };
  };

  verify = async () => {
    const result = await this.verificationService.execute();

    if (!result.success || !result.data) {
      useAuth.getState().setAuth({ authStatus: "unauthenticated", user: null });
      return;
    }

    useAuth.getState().setAuth({
      authStatus: "authenticated",
      user: result.data.user,
      accessToken: result.data.accessToken,
    });
    useAppStatus.getState().setAppStatus("syncing");
  };

  deleteAccount = async (): Promise<ServiceResult<null>> => {
    const result = await this.deleteAccountService.execute();

    if (result.success) {
      useAuth.getState().setAuth({ authStatus: "unauthenticated", user: null });
      useAppStatus.getState().setAppStatus("idle");
    } else {
      this.notificationsPort.notify(result.message, "error");
    }

    return result;
  };
}
