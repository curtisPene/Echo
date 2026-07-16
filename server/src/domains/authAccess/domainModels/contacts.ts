export interface Contacts {
  id: string;
  userId: string;
  contactIds: string[];
  blockedIds: string[];
}

export const Contacts = {
  createContacts(params: {
    id: string;
    userId: string;
    contactIds: string[];
    blockedIds: string[];
  }): Contacts {
    return { ...params };
  },

  hasContact(contacts: Contacts, userId: string): boolean {
    return contacts.contactIds.includes(userId);
  },

  hasBlocked(contacts: Contacts, userId: string): boolean {
    return contacts.blockedIds.includes(userId);
  },
};
