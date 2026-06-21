import { model, Schema, Types } from "mongoose";
import { User } from "../../users/models/userModel";

export interface Contacts {
  _id: Types.ObjectId;
  user: User["_id"];
  contacts: User["_id"][];
  blocked: User["_id"][];
  blockedBy: User["_id"][];
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
    blockedBy: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true },
);

export const Contacts = model<Contacts>("Contacts", contactsSchema);
