import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import {
  addContactResponseSchema,
  contactsSearchResponseSchema,
  type AddContactResponse,
  type ContactsSearchResponse,
} from "../types";

export const searchContactAPI = async (
  email: string,
): Promise<ContactsSearchResponse> => {
  const response = await httpClient.post("/contacts/search", { email });

  console.log(response);
  return parseOrReportError(contactsSearchResponseSchema, response.data);
};

export const addContactAPI = async ({
  contactId,
}: {
  contactId: string;
}): Promise<AddContactResponse> => {
  const response = await httpClient.post("/contacts/add", {
    contactId,
  });

  return parseOrReportError(addContactResponseSchema, response.data);
};
