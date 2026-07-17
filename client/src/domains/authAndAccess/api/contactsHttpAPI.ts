import {
  addContactResponseSchema,
  contactsSearchResponseSchema,
} from "../types";
import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import { User } from "../domainModels/user";
import type { ServiceResult } from "@/types";
import type { ContactDTO } from "../domainModels/contacts";

export const contactsHttpAPI = {
  async search(email: string): Promise<ServiceResult<User>> {
    const response = await httpClient.post("/contacts/search", { email });
    const parsed = parseOrReportError(contactsSearchResponseSchema, response.data);

    if (!parsed.success || !parsed.data) {
      return { success: false, message: parsed.message, data: null };
    }

    return {
      success: true,
      message: parsed.message,
      data: User.hydrate(parsed.data),
    };
  },

  async add({
    contactId,
  }: {
    contactId: string;
  }): Promise<ServiceResult<ContactDTO>> {
    const response = await httpClient.post("/contacts/add", { contactId });
    return parseOrReportError(addContactResponseSchema, response.data);
  },
};
