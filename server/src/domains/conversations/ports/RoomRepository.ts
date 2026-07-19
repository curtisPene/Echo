import { Room, NewRoom } from "../domainModels/room";

export interface RoomRepository {
  findById(params: { roomId: string }): Promise<Room | null>;
  findRoomsWithUserId(params: { userId: string; since?: Date }): Promise<Room[]>;
  create(room: NewRoom): Promise<Room>;
  update(room: Room): Promise<Room>;
  deleteById(params: { roomId: string }): Promise<boolean>;
}
