import { contactsRepo } from "@/domains/conversation/repo/contactsRepo";

export const getContactsService = async () => {
  return await contactsRepo.getContacts();
};
