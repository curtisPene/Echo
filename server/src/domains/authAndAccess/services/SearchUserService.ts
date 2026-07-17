import { ServiceResult } from "../../../types";
import { contactsRepo } from "../repo/ContactsRepo";
import { userRepo } from "../repo/UserRepo";
import { Identity, IdentityDTO } from "../domainModels/identity";

export class SearchUserService {
  async execute({
    email,
    viewerId,
  }: {
    email: string;
    viewerId: string;
  }): Promise<ServiceResult<{ user: IdentityDTO }>> {
    try {
      const user = await userRepo.findByEmail({ email });

      if (!user)
        return {
          success: false,
          message: "User not found",
          data: null,
        };

      const userContacts = await contactsRepo.findByUserId({
        userId: user.id,
      });

      // If the found user has blocked the viewer return success false
      if (userContacts.hasBlocked(viewerId))
        return { success: false, message: "User blocked", data: null };

      return {
        success: true,
        message: "User found",
        data: { user: Identity.hydrate(user).toDTO() },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "User not found",
        data: null,
      };
    }
  }
}
