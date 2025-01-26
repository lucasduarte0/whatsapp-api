import mongoose, { Schema, Document } from "mongoose";

// Define the IMessageMedia interface extending Mongoose Document
export interface IMessageMedia extends Document {
  sessionId: string;
  messageId: string;
  mimetype: string;
  data: string;
  filename?: string | null;
  filesize?: number | null;
}

// Create a Mongoose schema for the MessageMedia entity
const MessageMediaSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true }, // Required field
    messageId: { type: String, required: true }, // Required field
    mimetype: { type: String, required: true }, // Required field
    data: { type: String, required: true }, // Required field
    filename: { type: String, required: false, default: null }, // Optional field
    filesize: { type: Number, required: false, default: null }, // Optional field
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps for tracking
  }
);

// Export the MessageMedia model
const MessageMediaModel = mongoose.model<IMessageMedia>(
  "MessageMedia",
  MessageMediaSchema
);
export default MessageMediaModel;
