import {
  addContactResponseSchema,
  contactsSearchResponseSchema,
  type AddContactResponse,
  type ContactsSearchResponse,
} from "@/domains/conversation/types";
import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";

export const contactsHttpAPI = {
  async search(email: string): Promise<ContactsSearchResponse> {
    const response = await httpClient.post("/contacts/search", { email });
    return parseOrReportError(contactsSearchResponseSchema, response.data);
  },

  async add({ contactId }: { contactId: string }): Promise<AddContactResponse> {
    const response = await httpClient.post("/contacts/add", { contactId });
    return parseOrReportError(addContactResponseSchema, response.data);
  },
};
