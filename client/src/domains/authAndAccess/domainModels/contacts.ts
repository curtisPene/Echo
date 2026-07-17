export interface ContactDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

class Contact {
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;

  private constructor(dto: ContactDTO) {
    this.userId = dto.userId;
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.email = dto.email;
  }

  static hydrate(dto: ContactDTO): Contact {
    return new Contact(dto);
  }
}

export interface ContactsDTO {
  id: string;
  userId: string;
  contacts: ContactDTO[];
  blocked: ContactDTO[];
}

export class Contacts {
  readonly id: string;
  readonly userId: string;
  private readonly contacts: readonly Contact[];
  private readonly blocked: readonly Contact[];

  private constructor(
    id: string,
    userId: string,
    contacts: readonly Contact[],
    blocked: readonly Contact[],
  ) {
    this.id = id;
    this.userId = userId;
    this.contacts = contacts;
    this.blocked = blocked;
  }

  static hydrate(dto: ContactsDTO): Contacts {
    return new Contacts(
      dto.id,
      dto.userId,
      dto.contacts.map((c) => Contact.hydrate(c)),
      dto.blocked.map((c) => Contact.hydrate(c)),
    );
  }

  private findContact(contactId: string): Contact | undefined {
    return this.contacts.find((c) => c.userId === contactId);
  }

  private findBlocked(contactId: string): Contact | undefined {
    return this.blocked.find((c) => c.userId === contactId);
  }

  hasContact(contactId: string): boolean {
    return this.findContact(contactId) !== undefined;
  }

  hasBlocked(contactId: string): boolean {
    return this.findBlocked(contactId) !== undefined;
  }

  /**
   * Returns the contact/blocked lists as plain data - the only way outside
   * code can read this state. No Contact instance ever leaves this module.
   */
  getContacts(): ContactDTO[] {
    return this.contacts.map((c) => ({
      userId: c.userId,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
    }));
  }

  getBlocked(): ContactDTO[] {
    return this.blocked.map((c) => ({
      userId: c.userId,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
    }));
  }
}
