import mongoose, { Document, Schema } from "mongoose";
import {
  ChatId,
  InviteV4Data,
  MessageAck,
  MessageId,
  MessageTypes,
} from "whatsapp-web.js";
import ContactModel, { IContact } from "./Contact.model";
import { getContact } from "../services/contactService";
import { IMessageMedia } from "./MessageMedia.model";

// Define the IMessage interface
interface IMessage extends Document {
  sessionId: string;
  messageId: string;
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
  messageMedia?: IMessageMedia["_id"];
}

const MessageSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true }, // Required
    messageId: { type: String, required: true }, // Required
    ack: { type: String, enum: Object.values(MessageAck), required: false }, // Not required
    author: { type: String, required: false }, // Not required
    deviceType: { type: String, required: false }, // Not required
    body: { type: String, required: false }, // Not required
    broadcast: { type: Boolean, required: false }, // Not required
    isStatus: { type: Boolean, required: false }, // Not required
    isGif: { type: Boolean, required: false }, // Not required
    isEphemeral: { type: Boolean, required: false }, // Not required
    from: { type: String, required: false }, // Not required
    fromMe: { type: Boolean, required: false }, // Not required
    hasMedia: { type: Boolean, required: false }, // Not required
    hasQuotedMsg: { type: Boolean, required: false }, // Not required
    hasReaction: { type: Boolean, required: false }, // Not required
    duration: { type: String, required: false }, // Not required
    id: { type: Object, required: false }, // Not required
    isForwarded: { type: Boolean, required: false }, // Not required
    forwardingScore: { type: Number, required: false }, // Not required
    isStarred: { type: Boolean, required: false }, // Not required
    location: { type: String, required: false }, // Not required
    vCards: { type: [String], required: false }, // Not required
    inviteV4: { type: Object, required: false }, // Not required
    mediaKey: { type: String, required: false }, // Not required
    mentionedIds: { type: [String], required: false }, // Not required
    groupMentions: {
      type: [
        {
          groupSubject: { type: String, required: false }, // Not required
          groupJid: {
            server: { type: String, required: false }, // Not required
            user: { type: String, required: false }, // Not required
            _serialized: { type: String, required: false }, // Not required
          },
        },
      ],
      required: false, // Not required
    },
    timestamp: { type: Number, required: false }, // Not required
    to: { type: String, required: false }, // Not required
    type: { type: String, enum: Object.values(MessageTypes), required: false }, // Not required
    links: {
      type: [
        {
          link: { type: String, required: false }, // Not required
          isSuspicious: { type: Boolean, required: false }, // Not required
        },
      ],
      required: false, // Not required
    },
    orderId: { type: String, required: false }, // Not required
    title: { type: String, required: false }, // Not required
    description: { type: String, required: false }, // Not required
    businessOwnerJid: { type: String, required: false }, // Not required
    productId: { type: String, required: false }, // Not required
    latestEditSenderTimestampMs: { type: Number, required: false }, // Not required
    latestEditMsgKey: { type: Object, required: false }, // Not required
    dynamicReplyButtons: { type: Object, required: false }, // Not required
    selectedButtonId: { type: String, required: false }, // Not required
    selectedRowId: { type: String, required: false }, // Not required
    rawData: { type: Object, required: false }, // Not required
    pollName: { type: String, required: false }, // Not required
    pollOptions: { type: [String], required: false }, // Not required
    allowMultipleAnswers: { type: Boolean, required: false }, // Not required
    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: false, // Not required
    },
    messageMedia: {
      type: Schema.Types.ObjectId,
      ref: "MessageMedia",
      required: false, // Not required
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Pre-save middleware for Message model
MessageSchema.pre<IMessage>("save", async function (next) {
  // `this` refers to the document being saved
  const message = this as IMessage;

  try {
    // Check if the message doesn't have a contact associated and it has a 'from' field
    if (!message.contact && message.from) {
      // Look for an existing contact using the `from` field
      let contact = await ContactModel.findOne({ id: message.from });

      // If contact doesn't exist, create a new one
      if (!contact) {
        const contactDb = await getContact(message.sessionId, message.from);
        contact = new ContactModel({
          sessionId: message.sessionId,
          contactId: message.id?._serialized,
          ...contactDb,
        });

        contact = await contact.save();
      }

      // Associate the found or newly created contact with the message
      message.contact = contact._id;
    }

    // Proceed to save the message
    next();
  } catch (error) {
    console.error("Error in pre-save middleware for Message model:", error);
    next(); // Pass the error to the next middleware
  }
});

// Export the model
const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
export default MessageModel;
