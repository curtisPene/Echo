import { describe, expect, it } from "vitest";
import { VerifyAccessTokenService } from "../../services/VerifyAccessTokenService";
import type { TokenSigner } from "../../ports/TokenSigner";
import type { IdentityDTO } from "../../domainModels/identity";

const identity: IdentityDTO = {
  id: "507f1f77bcf86cd799439011",
  firstName: "Alan",
  lastName: "Turing",
  email: "alan@example.com",
};

function createFakeTokenSigner(): TokenSigner {
  return {
    signAccessToken: () => "fake-access-token",
    signRefreshToken: () => "fake-refresh-token",
    verifyAccessToken: (token) => (token === "valid-token" ? identity : null),
    verifyRefreshToken: () => null,
  };
}

describe("VerifyAccessTokenService", () => {
  it("succeeds and returns the identity when the signer verifies the token", () => {
    const tokenSigner = createFakeTokenSigner();
    const service = new VerifyAccessTokenService(tokenSigner);

    const result = service.execute({ accessToken: "valid-token" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toEqual(identity);
    expect(result.message).toBe("Authorized");
  });

  it("fails when the signer returns null (token rejected)", () => {
    const tokenSigner = createFakeTokenSigner();
    const service = new VerifyAccessTokenService(tokenSigner);

    const result = service.execute({ accessToken: "not-a-real-token" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid token");
  });
});
