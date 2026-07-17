import { contactsRepo } from "../repo/contactsRepo";

export const getContactsService = async () => {
  return await contactsRepo.getContacts();
};
