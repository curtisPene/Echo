import { Schema, Types } from "mongoose";
import { User } from "../../authAccess/mongooseModels/userModel";

export interface ContactRequest {
  _id: Types.ObjectId;
  sender: User["_id"];
  receiver: User["_id"];
  status: "pending" | "accepted" | "rejected";
}

export const requestSchema = new Schema<ContactRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: Schema.Types.String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);
