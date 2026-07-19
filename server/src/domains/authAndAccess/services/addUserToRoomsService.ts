import { Socket } from "socket.io";
import { FindRoomsForUserService } from "../../conversations/services/FindRoomsForUserService";
import { ServiceResult } from "../../../types";

export class AddUserToRoomsService {
  constructor(private readonly findRoomsForUserService: FindRoomsForUserService) {}

  async execute({
    socket,
    userId,
  }: {
    socket: Socket;
    userId: string;
  }): Promise<ServiceResult<null>> {
    try {
      // Join every room the user is a participant in - pending/accepted status
      // is a client-side rendering concern only, not a socket access boundary

      const rooms = await this.findRoomsForUserService.execute({ userId });

      rooms.forEach((room) => socket.join(room.id));

      // create the users personal room for receiving notifications across all devices
      socket.join(`user:${userId}`);

      return { success: true, message: "Rooms joined successfully", data: null };
    } catch (error) {
      console.log(error);
      return { success: false, message: "Rooms not joined", data: null };
    }
  }
}
