export interface AuthAndAccessSocket {
  /**
   * Joins every currently-connected socket for a user to a room, live -
   * for state changes (e.g. a new room created mid-session) that would
   * otherwise only take effect on the user's next reconnect.
   */
  joinRoom(params: { userId: string; roomId: string }): Promise<void>;

  /**
   * Removes every currently-connected socket for a user from a room, live.
   */
  leaveRoom(params: { userId: string; roomId: string }): Promise<void>;

  /**
   * Emits an event to every device of a user via their personal room
   * (`user:<id>`).
   */
  emitToUser(params: { userId: string; event: string; payload: unknown }): Promise<void>;

  /**
   * Emits an event to every socket currently joined to a room.
   */
  emitToRoom(params: { roomId: string; event: string; payload: unknown }): Promise<void>;

  /**
   * Forcibly disconnects every currently-connected socket for a user - for
   * when the user's account itself no longer exists (e.g. deleted), not for
   * leaving a specific room.
   */
  disconnectUser(params: { userId: string }): Promise<void>;
}
