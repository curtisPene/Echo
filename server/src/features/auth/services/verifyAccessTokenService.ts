import { verifyAccessToken } from "../adapters/jwtTokenAdapter";

export const verifyAccessTokenService = ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const payload = verifyAccessToken(accessToken);

  if (!payload) return { success: false, message: "Invalid token", data: null };

  return { success: true, message: "Authorized", data: payload };
};
