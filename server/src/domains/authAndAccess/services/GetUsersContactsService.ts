import { ContactsRepository } from "../ports/ContactsRepository";
import { ContactsDTO } from "../domainModels/contacts";

export class GetUsersContactsService {
  constructor(private readonly contactsRepo: ContactsRepository) {}

  async execute({ userId }: { userId: string }): Promise<ContactsDTO> {
    const contacts = await this.contactsRepo.findByUserId({ userId });

    return contacts.toDTO();
  }
}
