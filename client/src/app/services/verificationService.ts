import { verifyRefreshTokenAPI } from "@/features/auth/api/authAPI";
import type { User } from "@/features/auth/types";
import type { ServiceResult } from "@/types";

export const verificaitonService = async (): Promise<
  ServiceResult<{ accessToken: string; user: User }>
> => {
  const response = await verifyRefreshTokenAPI();

  if (!response.success || !response.data) {
    // setAuth({ authStatus: "unauthenticated", user: null });
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

  //   setAuth({
  //     authStatus: "authenticated",
  //     user: response.data.user,
  //     accessToken: response.data.accessToken,
  //   });
  //   setAppStatus("syncing");
};
