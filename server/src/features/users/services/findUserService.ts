import { ServiceResult } from "../../../types";
import { User } from "../models/userModel";
import { findUserByEmail } from "../repo/mongooseUserRepo";

export type FindUserResult = ServiceResult<{ user: User }>;

export async function findUserService({
  email,
}: {
  email: string;
}): Promise<FindUserResult> {
  try {
    const user = await findUserByEmail({ email });

    if (!user)
      return {
        success: false,
        message: "User not found",
        data: null,
      };

    return {
      success: true,
      message: "User found",
      data: { user: user },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "User not found",
      data: null,
    };
  }
}
