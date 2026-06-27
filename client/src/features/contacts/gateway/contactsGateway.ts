import { httpClient } from "@/lib/httpClient";
import { parseOrReportError } from "@/lib/parseOrReportError";
import {
  contactsSearchResponseSchema,
  type ContactsSearchResponse,
} from "../types";

export const searchContactGateway = async (
  email: string,
): Promise<ContactsSearchResponse> => {
  const response = await httpClient.post("/contacts/search", { email });
  return parseOrReportError(contactsSearchResponseSchema, response.data);
};

export const addContactGateway = async ({
  contactId,
}: {
  contactId: string;
}) => {
  const response = await httpClient.post("/contacts/add", {
    contactId,
  });

  return response.data;
};
