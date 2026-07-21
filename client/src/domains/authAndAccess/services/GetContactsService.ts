import type { ContactsRepository } from "../ports/ContactsRepository";

export class GetContactsService {
  private readonly contactsRepo: ContactsRepository;

  constructor(contactsRepo: ContactsRepository) {
    this.contactsRepo = contactsRepo;
  }

  async execute() {
    return await this.contactsRepo.getContacts();
  }
}
