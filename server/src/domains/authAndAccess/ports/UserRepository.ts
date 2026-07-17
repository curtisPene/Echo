import { User, NewUser } from "../domainModels/user";

export type CreateUserResult =
  | { success: true; user: User }
  | { success: false; reason: "duplicate_email" | "validation" | "unknown" };

export interface UserRepository {
  findById(params: { id: string }): Promise<User | null>;
  findByIds(ids: string[]): Promise<User[]>;
  findByEmail(params: { email: string }): Promise<User | null>;
  create(user: NewUser): Promise<CreateUserResult>;
  findLikeEmail(params: { email: string }): Promise<User[]>;
}
