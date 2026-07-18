import { RepoError } from "../../../errors/RepoError";
import { ServiceResult } from "../../../types";
import { contactsRepo } from "../repo/ContactsRepo";
import { userRepo } from "../repo/UserRepo";
import { ContactsDTO } from "../domainModels/contacts";
import { RoomDTO } from "../../conversations/domainModels/room";
import {
  findRoomsForUserService,
  removeParticipantFromRoomService,
  deleteRoomService,
} from "../../conversations/composition";
import {
  deleteRoomMessagesService,
  redactUserMessagesInRoomService,
} from "../../messaging/composition";

export type BlockedRoomResult =
  | { roomId: string }
  | { roomId: string; room: RoomDTO };

export const blockContactService = async ({
  user,
  blockedUser,
}: {
  user: string;
  blockedUser: string;
}): Promise<
  ServiceResult<{
    blocker: ContactsDTO;
    blocked: ContactsDTO;
    rooms: BlockedRoomResult[];
    affectedParticipantIds: string[];
  }>
> => {
  try {
    const blockedUserEntity = await userRepo.findById({ id: blockedUser });

    if (!blockedUserEntity)
      return { success: false, message: "User not found", data: null };

    const userEntity = await userRepo.findById({ id: user });

    if (!userEntity)
      return { success: false, message: "Internal server error", data: null };

    // Mutually delete the two users from their contacts lists, add the
    // blocked user to the blocker's blocked list
    const blockerContacts = await contactsRepo.findByUserId({ userId: user });
    const blockedContacts = await contactsRepo.findByUserId({ userId: blockedUser });

    const updatedDocs = await contactsRepo.saveBlockPair({
      blocker: blockerContacts.block(blockedUserEntity),
      blocked: blockedContacts.removeContact(user),
    });

    // Find all the rooms the user shares with the blocked user and remove the
    // user from that room or delete if its a one on one chat
    const rooms = await findRoomsForUserService.execute({ userId: user });

    const updatedRoomData = await Promise.all(
      rooms.map(async (room) => {
        const roomIncludesBlockedContact = room.participants.some(
          (participant) => participant.userId === blockedUser,
        );

        if (!roomIncludesBlockedContact) return null;

        const roomId = room.id;
        const isOneOnOne = room.participants.length === 2;

        // If the room is one on one delete the room and all the associated messages
        // otherwise remove the blocker from the room and redact their leftover messages
        if (isOneOnOne) {
          await deleteRoomService.execute({ roomId });
          await deleteRoomMessagesService.execute({ roomId });

          const blockedRoom: BlockedRoomResult = { roomId };
          return { blockedRoom, remainingParticipantIds: null };
        }

        const updatedRoom = await removeParticipantFromRoomService.execute({
          roomId,
          userId: user,
        });
        await redactUserMessagesInRoomService.execute({ userId: user, roomId });

        if (!updatedRoom) return null;

        const blockedRoom: BlockedRoomResult = {
          roomId,
          room: updatedRoom,
        };

        return {
          blockedRoom,
          remainingParticipantIds: updatedRoom.participants.map((p) => p.userId),
        };
      }),
    );

    const affectedRooms = updatedRoomData
      .filter((data): data is NonNullable<typeof data> => data !== null)
      .map((data) => data.blockedRoom);

    const reducedParticipantIds: string[] = [];
    updatedRoomData.forEach((data) => {
      if (!data || !data.remainingParticipantIds) return;

      reducedParticipantIds.push(...data.remainingParticipantIds);
    });

    // Dedupe by id so a user in multiple shared rooms only appears once
    const affectedParticipantIds = Array.from(new Set(reducedParticipantIds));

    // We shape the service result data so that the controller can derive
    // all the necessary actions for socket and http responses

    return {
      success: true,
      message: "Contact blocked successfully",
      data: {
        blocker: updatedDocs.blocker.toDTO(),
        blocked: updatedDocs.blocked.toDTO(),
        rooms: affectedRooms,
        affectedParticipantIds,
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
