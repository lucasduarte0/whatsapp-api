import mongoose, { Document, Schema } from 'mongoose';

interface IMessage extends Document {
  body: string;
  from: string;
  // Add other fields as needed based on the Message properties
}

const MessageSchema: Schema = new Schema({
  body: { type: String, required: true },
  from: { type: String, required: true },
  // Add other fields as needed based on the Message properties
});

const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);

export default MessageModel;
