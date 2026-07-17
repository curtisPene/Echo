import { contactsHttpAPI } from "../api/contactsHttpAPI";
import { contactsRepo } from "@/domains/conversation/repo/contactsRepo";
import type { Contact } from "@/domains/conversation/types";
import type { ServiceResult } from "@/types";

export const addContactService = async ({
  contactId,
}: {
  contactId: string;
}): Promise<ServiceResult<Contact>> => {
  const response = await contactsHttpAPI.add({ contactId });

  if (!response.success) {
    return {
      success: false,
      message: response.message,
      data: null,
    };
  }

  await contactsRepo.addContact(response.data);

  return {
    success: true,
    message: "Contact added successfully",
    data: response.data,
  };
};
