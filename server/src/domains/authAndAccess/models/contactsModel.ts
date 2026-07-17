import { model, Schema, Types } from "mongoose";

export interface Contacts {
  _id: Types.ObjectId;
  id: string;
  user: Types.ObjectId;
  contacts: Types.ObjectId[];
  blocked: Types.ObjectId[];
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Contacts = model<Contacts>("Contacts", contactsSchema);
