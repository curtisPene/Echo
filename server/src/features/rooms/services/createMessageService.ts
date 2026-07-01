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
  const messageDoc = await createNewMessage({ userId, message, roomId });

  const messageView = messagePresenter({ message: messageDoc });

  return {
    success: true,
    message: "Message created successfully",
    data: {
      message: messageView,
    },
  };
};
