import mongoose, { Document, Schema } from "mongoose";
import { ContactId } from "whatsapp-web.js";
import { getProfilePicUrl } from "../services/contactService";

export interface IContact extends Document {
  sessionId: string;
  contactId: string;
  id: ContactId;
  number?: string;
  isBusiness?: boolean;
  isEnterprise?: boolean;
  isGroup?: boolean;
  isMe?: boolean;
  isMyContact?: boolean;
  isUser?: boolean;
  isWAContact?: boolean;
  isBlocked?: boolean;
  labels?: string[];
  name?: string;
  pushname?: string;
  sectionHeader?: string;
  shortName?: string;
  statusMute?: boolean;
  type?: string;
  verifiedLevel?: string;
  verifiedName?: string;
  profilePicUrl?: string | null;
}

const ContactSchema = new Schema<IContact>(
  {
    sessionId: { type: String, required: true },
    contactId: { type: String, required: true, unique: true },
    id: { type: Object, required: true },
    number: { type: String, required: false },
    isBusiness: { type: Boolean, required: false },
    isEnterprise: { type: Boolean, required: false },
    isGroup: { type: Boolean, required: false },
    isMe: { type: Boolean, required: false },
    isMyContact: { type: Boolean, required: false },
    isUser: { type: Boolean, required: false },
    isWAContact: { type: Boolean, required: false },
    isBlocked: { type: Boolean, required: false },
    labels: { type: [String], required: false },
    name: { type: String, required: false },
    pushname: { type: String, required: false },
    sectionHeader: { type: String, required: false },
    shortName: { type: String, required: false },
    statusMute: { type: Boolean, required: false },
    type: { type: String, required: false },
    verifiedLevel: { type: String, required: false },
    verifiedName: { type: String, required: false },
    profilePicUrl: { type: String, required: false },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

ContactSchema.pre<IContact>("save", async function (next) {
  // `this` is the Contact being saved
  const contact = this as IContact;

  // Only fetch a new profile pic if the contact is new or something relevant changed
  if (this.isNew || contact.isModified("number") || !this.profilePicUrl) {
    // Suppose you have a function (or an external method) that does the actual fetch:

    contact.profilePicUrl = await getProfilePicUrl(
      contact.sessionId,
      contact.id._serialized
    );
  }

  next();
});

// Export the model
const ContactModel = mongoose.model<IContact>("Contact", ContactSchema);
export default ContactModel;
