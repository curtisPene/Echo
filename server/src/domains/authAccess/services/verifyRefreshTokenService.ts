import {
  PublicUser,
  userPresenter,
} from "../presenters/usersPresenter";
import { userRepo } from "../repo/mongooseUserRepo";
import { tokenAdapter } from "../adapters/tokenAdapter";
import { apiResponseSchema } from "../../../types/index";

export async function verifyRefreshTokenService({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const payload = tokenAdapter.verifyRefreshToken(refreshToken);

  if (!payload)
    return { success: false, message: "Invalid token", data: undefined };

  const user = await userRepo.findUserById({
    id: payload.id,
  });

  if (!user)
    return { success: false, message: "Invalid token", data: undefined };
  const accessToken = tokenAdapter.signAccessToken(payload);

  const publicUser = userPresenter(user);

  return {
    success: true,
    message: "Authorized",
    data: { accessToken, user: publicUser },
  };
}
