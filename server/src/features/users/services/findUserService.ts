import { ServiceResult } from "../../../types";
import { User } from "../models/userModel";
import { findUserByEmail } from "../repo/mongooseUserRepo";

export type FindUserResult = ServiceResult<{ user: User }>;

export async function findUserService({
  email,
}: {
  email: string;
}): Promise<FindUserResult> {
  const user = await findUserByEmail({ email });

  if (!user)
    return {
      success: false,
      message: "User not found",
      data: undefined,
    };

  return {
    success: true,
    message: "User found",
    data: { user: user },
  };
}
