import type { AuthSocket } from "../../../socket";
import type { ServiceResult } from "../../../types";

export class AuthAndAccessSocketControllers {
  onLogoutController = async ({
    socket,
    ack,
  }: {
    socket: AuthSocket;
    ack: (response: ServiceResult<null>) => void;
  }) => {
    socket.disconnect(true);
    ack({ success: true, message: "Logged out successfully", data: null });
  };
}
