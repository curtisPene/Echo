import { Schema, Types, model } from "mongoose";

export interface User {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const userSchema = new Schema<User>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const User = model<User>("User", userSchema);
