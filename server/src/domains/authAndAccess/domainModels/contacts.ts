import { DomainError } from "../../../errors/DomainError";
import { User } from "./user";

class Contact {
  private constructor(
    readonly userId: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
  ) {}

  static hydrate(user: User): Contact {
    return new Contact(user.id, user.firstName, user.lastName, user.email);
  }
}

export interface NewContacts {
  userId: string;
}

export interface ContactDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ContactsDTO {
  id: string;
  userId: string;
  contacts: ContactDTO[];
  blocked: ContactDTO[];
}

export class Contacts {
  private constructor(
    readonly id: string,
    readonly userId: string,
    private readonly contacts: readonly Contact[],
    private readonly blocked: readonly Contact[],
  ) {}

  /**
   * Reconstructs a Contacts from storage. Callers (the repo) must resolve
   * every referenced id to a real User before calling this - Contacts
   * itself never reaches out for that data, it just composes what it's
   * handed.
   */
  static hydrate(params: {
    id: string;
    userId: string;
    contacts: User[];
    blocked: User[];
  }): Contacts {
    return new Contacts(
      params.id,
      params.userId,
      params.contacts.map((user) => Contact.hydrate(user)),
      params.blocked.map((user) => Contact.hydrate(user)),
    );
  }

  static create(params: NewContacts): NewContacts {
    return { ...params };
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
   * Returns the contact/blocked lists as plain ids - the only way outside
   * code can read this state for persistence. No Contact instance ever
   * leaves this module.
   */
  getContactIds(): string[] {
    return this.contacts.map((c) => c.userId);
  }

  getBlockedIds(): string[] {
    return this.blocked.map((c) => c.userId);
  }

  /**
   * Returns the contact/blocked lists as plain data - used by toDTO(). No
   * Contact instance ever leaves this module.
   */
  private getContacts(): ContactDTO[] {
    return this.contacts.map((c) => ({
      userId: c.userId,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
    }));
  }

  private getBlocked(): ContactDTO[] {
    return this.blocked.map((c) => ({
      userId: c.userId,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
    }));
  }

  /**
   * The domain's own canonical, presentable shape - the single place this
   * aggregate defines how it looks to any caller (controller, cross-domain
   * service, ...). Callers should use this instead of re-deriving a view
   * from individual getters.
   */
  toDTO(): ContactsDTO {
    return {
      id: this.id,
      userId: this.userId,
      contacts: this.getContacts(),
      blocked: this.getBlocked(),
    };
  }

  /**
   * Adds a contact. Rejects if contactId is already blocked - a blocked
   * contact must be explicitly unblocked before they can be re-added.
   * No-op if already a contact. The caller must resolve the new contact's
   * User first (Contacts can't reach out for it itself).
   */
  addContact(user: User): Contacts {
    if (this.hasBlocked(user.id)) {
      throw new DomainError(`Cannot add contact ${user.id}: already blocked`);
    }

    if (this.hasContact(user.id)) return this;

    return new Contacts(
      this.id,
      this.userId,
      [...this.contacts, Contact.hydrate(user)],
      this.blocked,
    );
  }

  /**
   * Blocks a contact - moves them out of contacts and into blocked
   * (this side only; the blocked user's own Contacts is updated separately
   * via removeContact). The caller must resolve the blocked User first.
   */
  block(user: User): Contacts {
    return new Contacts(
      this.id,
      this.userId,
      this.contacts.filter((c) => c.userId !== user.id),
      this.hasBlocked(user.id) ? this.blocked : [...this.blocked, Contact.hydrate(user)],
    );
  }

  /**
   * Removes a contact from this side's contact list only, without
   * blocking them (used on the blocked user's own Contacts when someone
   * else blocks them).
   */
  removeContact(contactId: string): Contacts {
    return new Contacts(
      this.id,
      this.userId,
      this.contacts.filter((c) => c.userId !== contactId),
      this.blocked,
    );
  }
}
