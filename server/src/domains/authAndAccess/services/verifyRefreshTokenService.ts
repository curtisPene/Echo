import { Identity } from "../domainModels/identity";
import { userRepo } from "../repo/UserRepo";
import { TokenSigner } from "../ports/TokenSigner";

export class VerifyRefreshTokenService {
  constructor(private readonly tokenSigner: TokenSigner) {}

  async execute({ refreshToken }: { refreshToken: string }) {
    const payload = this.tokenSigner.verifyRefreshToken(refreshToken);

    if (!payload)
      return { success: false, message: "Invalid token", data: undefined };

    const user = await userRepo.findById({ id: payload.id });

    if (!user)
      return { success: false, message: "Invalid token", data: undefined };

    const identityDTO = Identity.hydrate(user).toDTO();
    const accessToken = this.tokenSigner.signAccessToken(identityDTO);

    return {
      success: true,
      message: "Authorized",
      data: { accessToken, user: identityDTO },
    };
  }
}
