import { AuthUser } from "./authUser";

export interface IdentityDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class Identity {
  private constructor(
    readonly id: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
  ) {}

  static hydrate(authUser: AuthUser): Identity {
    return new Identity(
      authUser.id,
      authUser.firstName,
      authUser.lastName,
      authUser.email,
    );
  }

  toDTO(): IdentityDTO {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    };
  }
}
