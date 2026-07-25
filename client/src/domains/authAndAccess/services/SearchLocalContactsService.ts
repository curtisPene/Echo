import type { ContactsRepository } from "../ports/ContactsRepository";
import type { ContactDTO } from "../entities/contacts";

export class SearchLocalContactsService {
  private readonly contactsRepo: ContactsRepository;

  constructor(contactsRepo: ContactsRepository) {
    this.contactsRepo = contactsRepo;
  }

  async execute({ email }: { email: string }): Promise<ContactDTO | null> {
    const contacts = await this.contactsRepo.getContacts();

    return contacts.find((contact) => contact.email === email) ?? null;
  }
}
