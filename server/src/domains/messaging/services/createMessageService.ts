import mongoose from "mongoose";
import { ServiceResult } from "../../../types";
import { MessageDTO } from "../domainModels/message";
import { MessageRepo } from "../repo/mongooseMessageRepo";
import { findUserIdentitiesService } from "../../authAndAccess/composition";

export const createMessageService = async ({
  userId,
  roomId,
  message,
}: {
  userId: string;
  roomId: string;
  message: string;
}): Promise<ServiceResult<{ message: MessageDTO }>> => {
  try {
    const identities = await findUserIdentitiesService.execute({ userIds: [userId] });
    const sender = identities[0];

    if (!sender) {
      return {
        success: false,
        message: "Sender not found",
        data: null,
      };
    }

    const createdMessage = await MessageRepo.create({
      roomId,
      sender,
      text: message,
    });

    return {
      success: true,
      message: "Message created successfully",
      data: {
        message: createdMessage.toDTO(),
      },
    };
  } catch (error) {
    if (error instanceof mongoose.Error) {
      return {
        success: false,
        message: "Invalid request data",
        data: null,
      };
    }
    return {
      success: false,
      message: "Internal Server Error",
      data: null,
    };
  }
};
