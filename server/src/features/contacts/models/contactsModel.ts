import { model, Schema, Types } from "mongoose";
import { User } from "../../users/models/userModel";

export interface Contacts {
  id: Types.ObjectId;
  user: User["_id"];
  contacts: User["_id"][];
  blocked: User["_id"][];
}

export const contactsSchema = new Schema<Contacts>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    contacts: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    blocked: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true },
);

export const Contacts = model<Contacts>("Contacts", contactsSchema);
