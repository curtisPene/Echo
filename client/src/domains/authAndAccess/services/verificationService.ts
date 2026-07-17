import {
  verifyRefreshTokenAPI,
  type LoginAPIResult,
} from "@/domains/authAndAccess/api/authAPI";

export const verificaitonService = async (): Promise<LoginAPIResult> => {
  const response = await verifyRefreshTokenAPI();

  if (!response.success || !response.data) {
    return {
      success: false,
      message: "Unauthorized",
      data: null,
    };
  }

  return {
    success: true,
    message: "Authorized",
    data: {
      accessToken: response.data.accessToken,
      user: response.data.user,
    },
  };
};
