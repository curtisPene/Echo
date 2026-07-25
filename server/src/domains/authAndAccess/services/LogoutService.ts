import { ServiceResult } from "../../../types";

export class LogoutService {
  async execute(): Promise<ServiceResult<null>> {
    // The service is purley ceremonial implemented for consistency with the
    // rest of the server codebase. On successful response the refresh token is removed
    // from the client, the is the followed by a socket event to disconnect the
    // socket associated with that device. The client then drops their
    // own local persistence, updates the app state, and the user is logged out.
    // So the actual service legwork is orchestrated on the clients logout service.
    return { success: true, message: "Logout successful", data: null };
  }
}
