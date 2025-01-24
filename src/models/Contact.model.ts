import mongoose, { Document, Schema } from "mongoose";
import { ContactId } from "whatsapp-web.js";
import { getProfilePicUrl } from "../services/contactService";

export interface IContact extends Document {
  sessionId: string;
  number: string;
  isBusiness: boolean;
  id: ContactId;
  isEnterprise: boolean;
  isGroup: boolean;
  isMe: boolean;
  isMyContact: boolean;
  isUser: boolean;
  isWAContact: boolean;
  isBlocked: boolean;
  labels?: string[];
  name?: string;
  pushname: string;
  sectionHeader: string;
  shortName?: string;
  statusMute: boolean;
  type: string;
  verifiedLevel?: string;
  verifiedName?: string;
  profilePicUrl?: string | null; // Add this field
}

const ContactSchema = new Schema<IContact>(
  {
    sessionId: { type: String, required: true },
    number: { type: String, required: true },
    isBusiness: { type: Boolean, required: true },
    isEnterprise: { type: Boolean, required: true },
    isGroup: { type: Boolean, required: true },
    isMe: { type: Boolean, required: true },
    isMyContact: { type: Boolean, required: true },
    isUser: { type: Boolean, required: true },
    isWAContact: { type: Boolean, required: true },
    isBlocked: { type: Boolean, required: true },
    labels: { type: [String], required: false },
    name: { type: String, required: false },
    pushname: { type: String, required: true },
    sectionHeader: { type: String, required: true },
    shortName: { type: String, required: false },
    statusMute: { type: Boolean, required: true },
    type: { type: String, required: true },
    verifiedLevel: { type: String, required: false },
    verifiedName: { type: String, required: false },
    profilePicUrl: { type: String, required: false },
  },
  {
    timestamps: true, // optional, but often useful
  }
);

ContactSchema.pre<IContact>("save", async function (next) {
  // `this` is the Contact being saved
  const contact = this as IContact;

  // Only fetch a new profile pic if the contact is new or something relevant changed
  if (this.isNew || contact.isModified("number") || !this.profilePicUrl) {
    // Suppose you have a function (or an external method) that does the actual fetch:

    contact.profilePicUrl = await getProfilePicUrl(
      contact.id._serialized,
      contact.number
    );
  }

  next();
});

// Export the model
const ContactModel = mongoose.model<IContact>("Contact", ContactSchema);
export default ContactModel;
