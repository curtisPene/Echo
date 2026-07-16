import bcrypt from "bcrypt";
import type { PasswordHasherPort } from "../domainModels/authUser";

export const passwordHasherAdapter: PasswordHasherPort = {
  async hash(plainPassword) {
    return bcrypt.hash(plainPassword, 10);
  },
  async compare(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },
};
