export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class User {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;

  private constructor(dto: UserDTO) {
    this.id = dto.id;
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.email = dto.email;
  }

  static hydrate(dto: UserDTO): User {
    return new User(dto);
  }
}
