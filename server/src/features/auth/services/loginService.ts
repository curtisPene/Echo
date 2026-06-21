import { PublicUser, toPublicUser } from "../../users/models/userModel";
import { ServiceResult } from "../../../types";
import { findUserByEmail } from "../../users/repo/mongooseUserRepo";
import { signAccessToken, signRefreshToken } from "../adapters/jwtTokenAdapter";
import { UserLoginDto } from "../types";

export type LoginUserReuslt = ServiceResult<{
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}>;

export async function loginService({
  email,
  password,
}: UserLoginDto): Promise<LoginUserReuslt> {
  const user = await findUserByEmail({ email });

  if (!user)
    return {
      success: false,
      message: "Invalid credentials",
      data: undefined,
    };

  if (user.password !== password)
    return {
      success: false,
      message: "Invalid credentials",
      data: undefined,
    };

  const accessToken = signAccessToken({
    id: user._id.toString(),
  });

  const refreshToken = signRefreshToken({
    id: user._id.toString(),
  });

  return {
    success: true,
    message: "User logged in successfully",
    data: { user: toPublicUser(user), accessToken, refreshToken },
  };
}
