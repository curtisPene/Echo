import { tokenAdapter } from "../adapters/tokenAdapter";

export const verifyAccessTokenService = ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const payload = tokenAdapter.verifyAccessToken(accessToken);

  if (!payload) return { success: false, message: "Invalid token", data: null };

  return { success: true, message: "Authorized", data: payload };
};
