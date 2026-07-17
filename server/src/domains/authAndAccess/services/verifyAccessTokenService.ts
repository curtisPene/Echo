import { TokenSigner } from "../ports/TokenSigner";

export class VerifyAccessTokenService {
  constructor(private readonly tokenSigner: TokenSigner) {}

  execute({ accessToken }: { accessToken: string }) {
    const payload = this.tokenSigner.verifyAccessToken(accessToken);

    if (!payload) return { success: false, message: "Invalid token", data: null };

    return { success: true, message: "Authorized", data: payload };
  }
}
