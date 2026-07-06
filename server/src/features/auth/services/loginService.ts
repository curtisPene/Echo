import { ServiceResult } from "../../../types";
import { User } from "../../users/models/userModel";
import {
  PublicUser,
  userPresenter,
} from "../../users/presenters/usersPresenter";
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
      data: null,
    };
  const publicUser = userPresenter(user);

  if (user.password !== password)
    return {
      success: false,
      message: "Invalid credentials",
      data: null,
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
    data: { user: publicUser, accessToken, refreshToken },
  };
}
