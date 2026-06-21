import { registrationGateway } from "../gateway/authGateway";
import type { UserRegistrationDto } from "../types";

const patterns = {
  firstName: /^[a-zA-Z]{1,32}$/,
  lastName: /^[a-zA-Z]{1,32}$/,
  userName: /^[a-zA-Z0-9_]{3,20}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,64}$/,
};

function validate(fields: UserRegistrationDto) {
  if (!patterns.firstName.test(fields.firstName))
    throw new Error("Invalid first name");
  if (!patterns.lastName.test(fields.lastName))
    throw new Error("Invalid last name");
  if (!patterns.userName.test(fields.userName))
    throw new Error("Invalid username");
  if (!patterns.email.test(fields.email)) throw new Error("Invalid email");
  if (!patterns.password.test(fields.password))
    throw new Error("Invalid password");
}

export async function registrationService(
  registrationData: UserRegistrationDto,
) {
  validate(registrationData);

  const authResult = await registrationGateway(registrationData);

  return authResult;
}
