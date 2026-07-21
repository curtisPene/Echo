import type { Room, RoomDTO, ParticipantDTO } from "../entities/room";
import type { RoomUnreadCount } from "../types";

export interface RoomsRepository {
  sync(params: { rooms: { room: RoomDTO; unread: number }[] }): Promise<void>;
  getRooms(): Promise<Room[]>;
  findById(roomId: string): Promise<Room | undefined>;
  create(params: {
    roomId: string;
    participants: ParticipantDTO[];
    name: string;
  }): Promise<string>;
  update(room: Room): Promise<void>;
  getUnreadCount(roomId: string): Promise<RoomUnreadCount | undefined>;
}
