import {
  PublicUser,
  userPresenter,
} from "../../users/presenters/usersPresenter";
import { findUserById } from "../../users/repo/mongooseUserRepo";
import {
  signAccessToken,
  verifyRefreshToken as verifyRefreshTokenAdapter,
} from "../adapters/jwtTokenAdapter";
import { apiResponseSchema } from "../../../types/index";

export async function verifyRefreshTokenService({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const payload = verifyRefreshTokenAdapter(refreshToken);

  if (!payload)
    return { success: false, message: "Invalid token", data: undefined };

  const user = await findUserById({
    id: payload.id.toString(),
  });

  if (!user)
    return { success: false, message: "Invalid token", data: undefined };
  const accessToken = signAccessToken(payload);

  const publicUser = userPresenter(user);

  return {
    success: true,
    message: "Authorized",
    data: { accessToken, user: publicUser },
  };
}
