export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface PasswordHasherPort {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hash: string): Promise<boolean>;
}

export const User = {
  createUser(params: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): User {
    return { ...params };
  },

  verifyPassword(
    user: User,
    plainPassword: string,
    passwordHasher: Pick<PasswordHasherPort, "compare">,
  ): Promise<boolean> {
    return passwordHasher.compare(plainPassword, user.password);
  },

  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  },
};
