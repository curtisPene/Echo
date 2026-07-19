import { describe, expect, it } from "vitest";
import { JwtTokenSigner } from "../../adapters/JWTTokenAdapter";
import type { IdentityDTO } from "../../domainModels/identity";

const identity: IdentityDTO = {
  id: "507f1f77bcf86cd799439011",
  firstName: "Alan",
  lastName: "Turing",
  email: "alan@example.com",
};

describe("JwtTokenSigner", () => {
  const tokenSigner = new JwtTokenSigner();

  it("signs an access token that verifies correctly against the access secret", () => {
    const accessToken = tokenSigner.signAccessToken(identity);

    const verified = tokenSigner.verifyAccessToken(accessToken);

    expect(verified).toEqual(identity);
  });

  it("signs a refresh token that verifies correctly against the refresh secret", () => {
    const refreshToken = tokenSigner.signRefreshToken(identity);

    const verified = tokenSigner.verifyRefreshToken(refreshToken);

    expect(verified).toEqual(identity);
  });

  it("does not verify an access token as a refresh token - proves the secrets are different", () => {
    const accessToken = tokenSigner.signAccessToken(identity);

    const verified = tokenSigner.verifyRefreshToken(accessToken);

    expect(verified).toBeNull();
  });

  it("does not verify a refresh token as an access token - proves the secrets are different", () => {
    const refreshToken = tokenSigner.signRefreshToken(identity);

    const verified = tokenSigner.verifyAccessToken(refreshToken);

    expect(verified).toBeNull();
  });

  it("rejects a garbage token on both verify methods", () => {
    expect(tokenSigner.verifyAccessToken("not-a-real-token")).toBeNull();
    expect(tokenSigner.verifyRefreshToken("not-a-real-token")).toBeNull();
  });
});
