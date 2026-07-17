import {
  registrationService,
  type RegistrationServiceArgs,
} from "../services/registrationService";

export type RegisterControllerResult =
  | { success: true }
  | { success: false; message: string };

export const registerController = async ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}: RegistrationServiceArgs): Promise<RegisterControllerResult> => {
  const result = await registrationService({
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
