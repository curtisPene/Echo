import { Schema, Types, model } from "mongoose";
import { User } from "../../users/models/userModel";

export interface RoomParticipant {
  user: User["_id"];
  lastReadAt?: Date;
}

export interface Room {
  _id: Types.ObjectId;
  participants: RoomParticipant[];
  name?: string;
  lastMessageAt?: Date;
}

export const roomParticipantSchema = new Schema<RoomParticipant>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastReadAt: {
      type: Schema.Types.Date,
    },
  },
  { _id: false },
);

export const roomSchema = new Schema<Room>(
  {
    participants: {
      type: [roomParticipantSchema],
      required: true,
    },
    name: {
      type: Schema.Types.String,
    },
    lastMessageAt: {
      type: Schema.Types.Date,
    },
  },
  { timestamps: true },
);

roomSchema.index({ "participants.user": 1 });

export const Room = model<Room>("Room", roomSchema);
