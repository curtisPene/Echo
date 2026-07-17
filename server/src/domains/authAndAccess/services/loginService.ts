import { ServiceResult } from "../../../types";
import { PublicUser, userPresenter } from "../presenters/usersPresenter";
import { userRepo } from "../repo/UserRepo";
import { PasswordHasher } from "../ports/PasswordHasher";
import { TokenSigner } from "../ports/TokenSigner";
import { UserLoginDto } from "../types/authTypes";

export type LoginUserReuslt = ServiceResult<{
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}>;

export class LoginService {
  constructor(
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenSigner: TokenSigner,
  ) {}

  async execute({ email, password }: UserLoginDto): Promise<LoginUserReuslt> {
    try {
      const user = await userRepo.findByEmail({ email });

      if (!user)
        return {
          success: false,
          message: "Invalid credentials",
          data: null,
        };
      const publicUser = userPresenter(user);

      const passwordMatch = await this.passwordHasher.compare(
        password,
        user.password,
      );

      if (!passwordMatch)
        return {
          success: false,
          message: "Invalid credentials",
          data: null,
        };

      const accessToken = this.tokenSigner.signAccessToken({ id: user.id });
      const refreshToken = this.tokenSigner.signRefreshToken({ id: user.id });

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
}
