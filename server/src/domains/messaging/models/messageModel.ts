import { Schema, Types, model } from "mongoose";
import { User } from "../../authAccess/mongooseModels/userModel";
import { Room } from "./roomModel";

export interface MessageReaction {
  user: User["_id"];
  emoji: string;
}

export interface MessageRead {
  user: User["_id"];
  readAt: Date;
}

export interface Message {
  _id: Types.ObjectId;
  room: Room["_id"];
  sender: User["_id"];
  text: string;
  reactions: MessageReaction[];
  readBy: MessageRead[];
  createdAt: Date;
  updatedAt: Date;
  redacted: boolean;
}

const messageReactionSchema = new Schema<MessageReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: Schema.Types.String,
      required: true,
    },
  },
  { _id: false },
);

const messageReadSchema = new Schema<MessageRead>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: {
      type: Schema.Types.Date,
      required: true,
    },
  },
  { _id: false },
);

export const messageSchema = new Schema<Message>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: Schema.Types.String,
      required: true,
    },
    reactions: {
      type: [messageReactionSchema],
      default: [],
    },
    readBy: {
      type: [messageReadSchema],
      default: [],
    },
  },
  { timestamps: true },
);

messageSchema.index({ room: 1, createdAt: 1 });

export const Message = model<Message>("Message", messageSchema);
