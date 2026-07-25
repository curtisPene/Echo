import { ServiceResult } from "../../../types";
import { ContactsRepository } from "../ports/ContactsRepository";
import { UserRepository } from "../ports/UserRepository";
import { Identity, IdentityDTO } from "../domainModels/identity";

export class SearchUserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly contactsRepo: ContactsRepository,
  ) {}

  async execute({
    email,
    viewerId,
  }: {
    email: string;
    viewerId: string;
  }): Promise<ServiceResult<{ user: IdentityDTO }>> {
    try {
      const user = await this.userRepo.findByEmail({ email });

      if (!user)
        return {
          success: false,
          message: "User not found",
          data: null,
        };

      const userContacts = await this.contactsRepo.findByUserId({
        userId: user.id,
      });

      // If the found user has blocked the viewer return success false
      if (userContacts.hasBlocked(viewerId))
        return { success: false, message: "User blocked", data: null };

      const viewerContacts = await this.contactsRepo.findByUserId({
        userId: viewerId,
      });

      // Don't surface someone the viewer has already blocked - whether
      // they're already a contact, or already in a given room, is a
      // decision for the caller (AddContactService, room-participant
      // search, etc.), not this shared find-by-email primitive.
      if (viewerContacts.hasBlocked(user.id))
        return { success: false, message: "User not found", data: null };

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
