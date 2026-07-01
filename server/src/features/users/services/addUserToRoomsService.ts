import { Socket } from "socket.io";
import { findRoomsWithUserId } from "../../rooms/repo/mongooseRoomRepo";

export const addUserToRoomsService = async ({
  socket,
  userId,
}: {
  socket: Socket;
  userId: string;
}) => {
  const rooms = await findRoomsWithUserId({ userId });
  const roomIds = rooms.map((r) => r._id.toString());

  roomIds.forEach((roomId) => socket.join(roomId));

  console.log(`User ${userId} joined rooms: ${roomIds}`);
};
