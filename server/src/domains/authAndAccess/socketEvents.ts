export const AuthEvents = {
  UNAUTHORIZED: "auth:unauthorized",
} as const;

export interface AuthServerToClientEvents {
  [AuthEvents.UNAUTHORIZED]: () => void;
}
