import mongoose from "mongoose";
import { messagePresenter } from "../presenters/messagePresenter";
import { createNewMessage } from "../repo/mongooseMessageRepo";

export const createMessageService = async ({
  userId,
  roomId,
  message,
}: {
  userId: string;
  roomId: string;
  message: string;
}) => {
  try {
    const messageDoc = await createNewMessage({ userId, message, roomId });

    const messageView = messagePresenter({ message: messageDoc });

    return {
      success: true,
      message: "Message created successfully",
      data: {
        message: messageView,
      },
    };
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return {
        success: false,
        message: "Invalid room id or sender id",
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
