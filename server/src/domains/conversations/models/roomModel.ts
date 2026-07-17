import { Schema, Types, model } from "mongoose";

export interface RoomParticipant {
  user: Types.ObjectId;
  lastReadAt?: Date;
  status?: "pending" | "accepted";
}

export interface Room {
  _id: Types.ObjectId;
  participants: RoomParticipant[];
  name: string;
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
    status: {
      type: Schema.Types.String,
      enum: ["pending", "accepted"],
      default: "pending",
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
      required: true,
    },
    lastMessageAt: {
      type: Schema.Types.Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

roomSchema.index({ "participants.user": 1 });

export const Room = model<Room>("Room", roomSchema);
