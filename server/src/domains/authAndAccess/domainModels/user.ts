export interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class User {
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
  }): User {
    return new User(
      params.id,
      params.firstName,
      params.lastName,
      params.email,
      params.password,
    );
  }

  static create(params: NewUser): NewUser {
    return { ...params };
  }
}
