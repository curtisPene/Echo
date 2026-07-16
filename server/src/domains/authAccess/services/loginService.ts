import { ServiceResult } from "../../../types";
import {
  PublicUser,
  userPresenter,
} from "../presenters/usersPresenter";
import { userRepo } from "../repo/mongooseUserRepo";
import { User as UserDomain } from "../domainModels/authUser";
import { passwordHasherAdapter } from "../adapters/passwordHasherAdapter";
import { tokenAdapter } from "../adapters/tokenAdapter";
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
  try {
    const user = await userRepo.findUserByEmail({ email });

    if (!user)
      return {
        success: false,
        message: "Invalid credentials",
        data: null,
      };
    const publicUser = userPresenter(user);

    const passwordMatch = await UserDomain.verifyPassword(
      user,
      password,
      passwordHasherAdapter,
    );

    if (!passwordMatch)
      return {
        success: false,
        message: "Invalid credentials",
        data: null,
      };

    const accessToken = tokenAdapter.signAccessToken({
      id: user.id,
    });

    const refreshToken = tokenAdapter.signRefreshToken({
      id: user.id,
    });

    return {
      success: true,
      message: "User logged in successfully",
      data: { user: publicUser, accessToken, refreshToken },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Internal server error",
      data: null,
    };
  }
}
