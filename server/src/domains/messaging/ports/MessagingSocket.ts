export interface MessagingSocket {
  /**
   * Emits an event to every socket currently joined to a room.
   */
  emitToRoom(params: { roomId: string; event: string; payload: unknown }): Promise<void>;
}
