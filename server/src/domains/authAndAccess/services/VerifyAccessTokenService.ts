import { TokenSigner } from "../ports/TokenSigner";
import type { IdentityDTO } from "../domainModels/identity";
import type { ServiceResult } from "../../../types";

export class VerifyAccessTokenService {
  constructor(private readonly tokenSigner: TokenSigner) {}

  execute({
    accessToken,
  }: {
    accessToken: string;
  }): ServiceResult<IdentityDTO> {
    const payload = this.tokenSigner.verifyAccessToken(accessToken);

    if (!payload) return { success: false, message: "Invalid token", data: null };

    return { success: true, message: "Authorized", data: payload };
  }
}
