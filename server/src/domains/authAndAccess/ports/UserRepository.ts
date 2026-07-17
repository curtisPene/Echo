import { AuthUser, NewAuthUser } from "../domainModels/authUser";

export type CreateUserResult =
  | { success: true; user: AuthUser }
  | { success: false; reason: "duplicate_email" | "validation" | "unknown" };

export interface UserRepository {
  findById(params: { id: string }): Promise<AuthUser | null>;
  findByIds(ids: string[]): Promise<AuthUser[]>;
  findByEmail(params: { email: string }): Promise<AuthUser | null>;
  create(user: NewAuthUser): Promise<CreateUserResult>;
  findLikeEmail(params: { email: string }): Promise<AuthUser[]>;
}
