import type { IdentityDTO } from "../domainModels/identity";

export interface TokenSigner {
  signAccessToken(payload: IdentityDTO): string;
  signRefreshToken(payload: IdentityDTO): string;
  verifyAccessToken(token: string): IdentityDTO | null;
  verifyRefreshToken(token: string): IdentityDTO | null;
}
