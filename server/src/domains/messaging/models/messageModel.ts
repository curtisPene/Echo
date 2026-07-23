import { Schema, Types, model } from "mongoose";

export type DeliveryStatus = "sent" | "delivered" | "failed" | "sending";

export interface MessageReaction {
  user: Types.ObjectId;
  emoji: string;
}

export interface MessageRead {
  user: Types.ObjectId;
  readAt: Date;
}

export interface Message {
  _id: Types.ObjectId;
  id: string;
  room: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  reactions: MessageReaction[];
  readBy: MessageRead[];
  createdAt: Date;
  updatedAt: Date;
  redacted: boolean;
  deliveryStatus: DeliveryStatus;
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
    redacted: {
      type: Schema.Types.Boolean,
      default: false,
    },
    deliveryStatus: {
      type: Schema.Types.String,
      enum: ["sending", "sent", "delivered", "failed"],
      default: "sent",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

messageSchema.index({ room: 1, createdAt: 1 });

export const Message = model<Message>("Message", messageSchema);
