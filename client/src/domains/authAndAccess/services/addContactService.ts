import { contactsHttpAPI } from "../api/contactsHttpAPI";
import { contactsRepo } from "../repo/contactsRepo";
import type { ContactDTO } from "../domainModels/contacts";
import type { ServiceResult } from "@/types";

export class AddContactService {
  async execute({
    userId,
    contactId,
  }: {
    userId: string;
    contactId: string;
  }): Promise<ServiceResult<ContactDTO>> {
    const contacts = await contactsRepo.getContactsAggregate(userId);

    if (contacts.hasBlocked(contactId)) {
      return {
        success: false,
        message: "Contact already blocked",
        data: null,
      };
    }

    if (contacts.hasContact(contactId)) {
      return {
        success: false,
        message: "Contact already added",
        data: null,
      };
    }

    const response = await contactsHttpAPI.add({ contactId });

    if (!response.success || !response.data) {
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
  }
}
