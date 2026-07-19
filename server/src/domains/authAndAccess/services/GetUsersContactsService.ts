import { ContactsRepository } from "../ports/ContactsRepository";

export class GetUsersContactsService {
  constructor(private readonly contactsRepo: ContactsRepository) {}

  async execute({ userId }: { userId: string }): Promise<{ blockedIds: string[] }> {
    const contacts = await this.contactsRepo.findByUserId({ userId });

    return { blockedIds: contacts.getBlockedIds() };
  }
}
