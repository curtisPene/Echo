import { Socket } from "socket.io";
import { findRoomsWithUserId } from "../../messaging/repo/mongooseRoomRepo";
import { ServiceResult } from "../../../types";

export const addUserToRoomsService = async ({
  socket,
  userId,
}: {
  socket: Socket;
  userId: string;
}): Promise<ServiceResult<null>> => {
  try {
    // Join every room the user is a participant in - pending/accepted status
    // is a client-side rendering concern only, not a socket access boundary

    const roomsDocs = await findRoomsWithUserId({ userId });
    const roomIds = roomsDocs.map((r) => r._id.toString());

    roomIds.forEach((roomId) => socket.join(roomId));

    // create the users personal room for receiving notifications across all devices
    socket.join(`user:${userId}`);

    return { success: true, message: "Rooms joined successfully", data: null };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Rooms not joined", data: null };
  }
};
