export const PresenceEvents = {
  ONLINE: "user:online",
  OFFLINE: "user:offline",
} as const;

export interface PresenceServerToClientEvents {
  [PresenceEvents.ONLINE]: (payload: { userId: string }) => void;
  [PresenceEvents.OFFLINE]: (payload: { userId: string }) => void;
}
