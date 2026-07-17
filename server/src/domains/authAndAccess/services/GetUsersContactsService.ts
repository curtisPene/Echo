import { contactsRepo } from "../repo/ContactsRepo";

export class GetUsersContactsService {
  async execute({ userId }: { userId: string }): Promise<{ blockedIds: string[] }> {
    const contacts = await contactsRepo.findByUserId({ userId });

    return { blockedIds: contacts.getBlockedIds() };
  }
}
