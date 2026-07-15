import type { ServiceResult } from "@/types";
import { addContactAPI } from "../api/contactsHttpAPI";
import type { Contact } from "../types";
import { addContactRepo } from "../repo/contactsRepo";

export const addContactService = async ({
  contactId,
}: {
  contactId: string;
}): Promise<ServiceResult<Contact>> => {
  const response = await addContactAPI({
    contactId,
  });

  if (!response.success)
    return {
      success: false,
      message: response.message,
      data: null,
    };

  await addContactRepo({ contact: response.data });

  return {
    success: true,
    message: "Contact added successfully",
    data: response.data,
  };
};
