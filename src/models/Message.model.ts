import mongoose, { Document, Schema } from "mongoose";
import {
  ChatId,
  InviteV4Data,
  MessageAck,
  MessageId,
  MessageTypes,
} from "whatsapp-web.js";
import ContactModel, { IContact } from "./Contact.model";

// Define the IMessage interface
interface IMessage extends Document {
  sessionId: string;
  ack?: MessageAck;
  author?: string;
  deviceType?: string;
  body?: string;
  broadcast?: boolean;
  isStatus?: boolean;
  isGif?: boolean;
  isEphemeral?: boolean;
  from?: string;
  fromMe?: boolean;
  hasMedia?: boolean;
  hasQuotedMsg?: boolean;
  hasReaction?: boolean;
  duration?: string;
  id?: MessageId;
  isForwarded?: boolean;
  forwardingScore?: number;
  isStarred?: boolean;
  location?: string;
  vCards?: string[];
  inviteV4?: InviteV4Data;
  mediaKey?: string;
  mentionedIds?: ChatId[];
  groupMentions?: {
    groupSubject?: string;
    groupJid?: {
      server?: string;
      user?: string;
      _serialized?: string;
    };
  }[];
  timestamp?: number;
  to?: string;
  type?: MessageTypes;
  links?: Array<{
    link?: string;
    isSuspicious?: boolean;
  }>;
  orderId?: string;
  title?: string;
  description?: string;
  businessOwnerJid?: string;
  productId?: string;
  latestEditSenderTimestampMs?: number;
  latestEditMsgKey?: MessageId;
  dynamicReplyButtons?: object;
  selectedButtonId?: string;
  selectedRowId?: string;
  rawData?: object;
  pollName?: string;
  pollOptions?: string[];
  allowMultipleAnswers?: boolean;

  /** Reference to a Contact document (ObjectId) */
  contact?: IContact["_id"];
}

// Define the MessageSchema
const MessageSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true },
    ack: { type: String, enum: Object.values(MessageAck), required: false },
    author: { type: String, required: false },
    deviceType: { type: String, required: false },
    body: { type: String, required: false },
    broadcast: { type: Boolean, required: false },
    isStatus: { type: Boolean, required: false },
    isGif: { type: Boolean, required: false },
    isEphemeral: { type: Boolean, required: false },
    from: { type: String, required: false },
    fromMe: { type: Boolean, required: false },
    hasMedia: { type: Boolean, required: false },
    hasQuotedMsg: { type: Boolean, required: false },
    hasReaction: { type: Boolean, required: false },
    duration: { type: String, required: false },
    id: { type: Object, required: false },
    isForwarded: { type: Boolean, required: false },
    forwardingScore: { type: Number, required: false },
    isStarred: { type: Boolean, required: false },
    location: { type: String, required: false },
    vCards: { type: [String], required: false },
    inviteV4: { type: Object, required: false },
    mediaKey: { type: String, required: false },
    mentionedIds: { type: [String], required: false },
    groupMentions: {
      type: [
        {
          groupSubject: { type: String, required: false },
          groupJid: {
            server: { type: String, required: false },
            user: { type: String, required: false },
            _serialized: { type: String, required: false },
          },
        },
      ],
      required: false,
    },
    timestamp: { type: Number, required: false },
    to: { type: String, required: false },
    type: { type: String, enum: Object.values(MessageTypes), required: false },
    links: {
      type: [
        {
          link: { type: String, required: false },
          isSuspicious: { type: Boolean, required: false },
        },
      ],
      required: false,
    },
    orderId: { type: String, required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    businessOwnerJid: { type: String, required: false },
    productId: { type: String, required: false },
    latestEditSenderTimestampMs: { type: Number, required: false },
    latestEditMsgKey: { type: Object, required: false },
    dynamicReplyButtons: { type: Object, required: false },
    selectedButtonId: { type: String, required: false },
    selectedRowId: { type: String, required: false },
    rawData: { type: Object, required: false },
    pollName: { type: String, required: false },
    pollOptions: { type: [String], required: false },
    allowMultipleAnswers: { type: Boolean, required: false },
    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: false,
    },
  },
  {
    timestamps: true, // optional, but often useful
  }
);

// Pre-save middleware for Message model
MessageSchema.pre<IMessage>("save", async function (next) {
  // `this` refers to the document being saved
  const message = this as IMessage

  try {
    // Check if the message doesn't have a contact associated and it has a 'from' field
    if (!message.contact && message.from) {
      // Look for an existing contact using the `from` field
      let contact = await ContactModel.findOne({ id: message.from });

      // If contact doesn't exist, create a new one
      if (!contact) {
        contact = new ContactModel({
          phone: message.from,
          // Add other fields that are necessary for the contact
        });

        await contact.save();
      }

      // Associate the found or newly created contact with the message
      message.contact = contact._id;
    }

    // Proceed to save the message
    next();
  } catch (error) {
    console.error("Error in pre-save middleware for Message model:", error);
    next(error); // Pass the error to the next middleware
  }
});

// Export the model
const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
export default MessageModel;
