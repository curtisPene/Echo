import { AuthSocket } from "../../../socket";

export const onContactRequestController = ({
  payload,
  socket,
}: {
  payload: { message: string };
  socket: AuthSocket;
}) => {
  const userId = socket.data.userId;
};
