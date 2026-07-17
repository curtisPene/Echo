import { DomainError } from "../../../errors/DomainError";

export interface NewAuthUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface NewAuthUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class AuthUser {
  private constructor(
    readonly id: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    readonly password: string,
  ) {}

  static hydrate(params: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): AuthUser {
    return new AuthUser(
      params.id,
      params.firstName,
      params.lastName,
      params.email,
      params.password,
    );
  }

  /**
   * Validates that password and confirmPassword match before admitting the
   * registration input as a real NewAuthUser - confirmPassword itself is
   * never persisted, it only exists to guard this creation step.
   */
  static create(params: NewAuthUserInput): NewAuthUser {
    if (params.password !== params.confirmPassword) {
      throw new DomainError("Password and confirm password do not match");
    }

    return {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      password: params.password,
    };
  }
}
