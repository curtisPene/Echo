import { RepoError } from "../../../errors/RepoError";
import { ServiceResult } from "../../../types";
import {
  deleteRoomMessages,
  redactRoomMessagesByUserId,
} from "../../rooms/repo/mongooseMessageRepo";
import {
  deleteRoomById,
  findRoomsWithUserId,
  removeContactFromRoomById,
  RoomWithPopulatedParticipants,
} from "../../rooms/repo/mongooseRoomRepo";
import { User } from "../../users/models/userModel";
import {
  blockContact,
  ContactsWithPopulatedUsers,
  ContactsWithPopulatedUserAndContacts,
} from "../repo/mongooseContactsRepo";

export const blockContactService = async ({
  user,
  blockedUser,
}: {
  user: string;
  blockedUser: string;
}): Promise<
  ServiceResult<{
    blocker: ContactsWithPopulatedUsers;
    blocked: ContactsWithPopulatedUserAndContacts;
    rooms: {
      roomId: string;
      isOneOnOne: boolean;
    }[];
    affectedParticipants: User[];
  }>
> => {
  try {
    // Mutually delete the two user from their contacts lists, add the blocked
    // user to the blocker's blocked list
    const updatedDocs = await blockContact({
      userId: user,
      contactId: blockedUser,
    });

    // Find all the rooms the user shares with the blocked user and remove the
    // user from that room or delete if its a one on one chat
    const roomDocs = await findRoomsWithUserId({ userId: user });
    const updatedRoomData = await Promise.all(
      roomDocs.map(async (room) => {
        const roomIncludesBlockedContact = room.participants.some(
          (participant) => participant.user._id.toString() === blockedUser,
        );

        if (!roomIncludesBlockedContact) return null;

        const roomId = room._id.toString();
        const isOneOnOne = room.participants.length === 2;

        // If the room is one on one delete the room and all the associated messages
        // otherwise remove the blocker from the room and redact their leftover messages
        let remainingParticipants: User[] | null = null;
        if (isOneOnOne) {
          await deleteRoomById({ roomId });
          await deleteRoomMessages({ roomId });
          remainingParticipants = null;
        } else {
          const updatedRoom = await removeContactFromRoomById({
            roomId,
            userId: user,
          });
          remainingParticipants = updatedRoom.participants.map(
            (participant) => participant.user,
          );
          await redactRoomMessagesByUserId({ userId: user, roomId });
        }

        return { roomId, isOneOnOne, remainingParticipants };
      }),
    );

    const affectedRooms = updatedRoomData
      .filter((data): data is NonNullable<typeof data> => data !== null)
      .map(({ roomId, isOneOnOne }) => ({ roomId, isOneOnOne }));

    const reducedParticipants: User[] = [];
    updatedRoomData.forEach((data) => {
      if (!data || !data.remainingParticipants) return;

      reducedParticipants.push(...data.remainingParticipants);
    });

    // Dedupe by id so a user in multiple shared rooms only appears once
    // Note: Deduping was really hard to do for me personally, thankyou Claude!! XD
    const affectedParticipants = Array.from(
      new Map(
        reducedParticipants.map((participant) => [
          participant._id.toString(),
          participant,
        ]),
      ).values(),
    );

    // We shape the service result data so that the controller can derive
    // all the necessary actions for socekt and http responses

    return {
      success: true,
      message: "Contact blocked successfully",
      data: {
        blocker: updatedDocs.blocker,
        blocked: updatedDocs.blocked,
        rooms: affectedRooms,
        affectedParticipants,
      },
    };
  } catch (error) {
    if (error instanceof RepoError) {
      console.error("[Repo]", error.message);
    } else {
      console.log(error);
    }
    return { success: false, message: "Internal Server Error", data: null };
  }
};
