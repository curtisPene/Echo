import { PublicUser, toPublicUser } from "../../users/models/userModel";
import { ServiceResult } from "../../../types";
import { findUserById } from "../../users/repo/mongooseUserRepo";
import {
  signAccessToken,
  verifyRefreshToken as verifyRefreshTokenAdapter,
} from "../adapters/jwtTokenAdapter";

export type VerifyRefreshTokenResult = ServiceResult<{
  accessToken: string;
  user: PublicUser;
}>;

export async function verifyRefreshTokenService({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<VerifyRefreshTokenResult> {
  const payload = verifyRefreshTokenAdapter(refreshToken);

  if (!payload)
    return { success: false, message: "Invalid token", data: undefined };

  const user = await findUserById({
    id: payload.id.toString(),
  });

  if (!user)
    return { success: false, message: "Invalid token", data: undefined };
  const accessToken = signAccessToken(payload);

  return {
    success: true,
    message: "Authorized",
    data: { accessToken, user: toPublicUser(user) },
  };
}
