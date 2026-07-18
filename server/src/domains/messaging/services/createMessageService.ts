import mongoose from "mongoose";
import { ServiceResult } from "../../../types";
import { MessageDTO, NewMessage, SenderEntity } from "../domainModels/message";
import { MessageRepo } from "../repo/mongooseMessageRepo";

export const createMessageService = async ({
  sender,
  newMessage,
}: {
  sender: SenderEntity;
  newMessage: Omit<NewMessage, "sender">;
}): Promise<ServiceResult<{ message: MessageDTO }>> => {
  try {
    const createdMessage = await MessageRepo.create({
      ...newMessage,
      sender,
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
