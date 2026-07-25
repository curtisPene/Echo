import type { ServiceResult } from "../../types";

export const AuthEvents = {
  UNAUTHORIZED: "auth:unauthorized",
  LOGOUT: "auth:logout",
} as const;

export interface AuthServerToClientEvents {
  [AuthEvents.UNAUTHORIZED]: () => void;
}

export interface AuthClientToServerEvents {
  [AuthEvents.LOGOUT]: (ack: (response: ServiceResult<null>) => void) => void;
}
