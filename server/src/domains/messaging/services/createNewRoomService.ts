import mongoose from "mongoose";
import { ServiceResult } from "../../../types";
import { RepoError } from "../../../errors/RepoError";
import { findContactsByUserId } from "../../conversations/repo/mongooseContactsRepo";
import { findUserById } from "../../authAccess/repo/mongooseUserRepo";
import {
  createRoom,
  RoomWithPopulatedParticipants,
} from "../repo/mongooseRoomRepo";

export const createNewRoomService = async ({
  user,
  participants,
  name,
}: {
  user: string;
  participants: { user: string }[];
  name: string;
}): Promise<ServiceResult<RoomWithPopulatedParticipants>> => {
  try {
    // Ensure all participants exist, return success false if not
    const userDocs = (
      await Promise.all(
        participants.map((participant) =>
          findUserById({ id: participant.user }),
        ),
      )
    ).filter((user): user is NonNullable<typeof user> => user !== null);

    if (userDocs.length !== participants.length)
      return {
        success: false,
        message: "One or more participants could not be found",
        data: null,
      };

    // Has the user blocked any of the participants, return success false if so
    const userContactsDoc = await findContactsByUserId({ userId: user });

    const userHasBlockedSomeParticipant = userDocs.some((participant) =>
      userContactsDoc.blocked.some(
        (id) => id.toString() === participant._id.toString(),
      ),
    );

    if (userHasBlockedSomeParticipant)
      return {
        success: false,
        message: "You have blocked one or more participants",
        data: null,
      };

    // Have any of the participants blocked the user? Return success false if so
    const participantsContactsDocs = await Promise.all(
      userDocs.map((participant) =>
        findContactsByUserId({ userId: participant._id.toString() }),
      ),
    );

    const userHasBeenBlockedBySomeParticipant = participantsContactsDocs.some(
      (participantContactsDoc) =>
        participantContactsDoc.blocked.some((id) => id.toString() === user),
    );

    if (userHasBeenBlockedBySomeParticipant)
      return {
        success: false,
        message: "One or more participants have blocked you",
        data: null,
      };

    // Create the room - the creator is auto-accepted, everyone else defaults to pending
    const roomDoc = await createRoom({
      name,
      participants: [
        { user, status: "accepted" },
        ...participants.map((participant) => ({ user: participant.user })),
      ],
    });

    return {
      success: true,
      message: "Room created successfully",
      data: roomDoc,
    };
  } catch (error) {
    if (error instanceof mongoose.Error) {
      console.error("[Mongoose]", error.message);
      return { success: false, message: "Invalid request data", data: null };
    }

    if (error instanceof RepoError) {
      console.error("[Repo]", error.message);
    } else {
      console.error(error);
    }
    return { success: false, message: "Internal server error", data: null };
  }
};
