import MessageModel from "../models/Message.model";
import { Message, MessageMedia } from "whatsapp-web.js";
import MessageMediaModel from "../models/MessageMedia.model";

// Example event handler for messages
export async function handleSaveTextMessage(
  sessionId: string,
  message: Message
) {
  try {
    // Use findOneAndUpdate to either update the existing message or insert a new one
    await MessageModel.findOneAndUpdate(
      { messageId: message.id._serialized }, // Filter criteria
      {
        $set: {
          ...message,
          sessionId, // Ensure sessionId is set or updated as well
          messageId: message.id._serialized, // Ensure messageId is set or updated as well
        },
      },
      { upsert: true, new: true } // Options: upsert => create if not exists, new => return the modified document
    );
  } catch (error) {
    console.error("Error handling message:", error);
  }
}

// Example event handler for messages with media
export async function handleSaveMediaMessage(
  sessionId: string,
  message: Message,
  messageMedia: MessageMedia
) {
  try {
    // Use findOneAndUpdate to either update the existing message or insert a new one
    await MessageMediaModel.findOneAndUpdate(
      { messageId: message.id._serialized }, // Filter criteria
      {
        $set: {
          ...messageMedia,
          sessionId, // Ensure sessionId is set or updated as well
          messageId: message.id._serialized, // Ensure messageId is set or updated as well
        },
      },
      { upsert: true, new: true } // Options: upsert => create if not exists, new => return the modified document
    );

    // Use findOneAndUpdate to either update the existing message or insert a new one
    await handleSaveTextMessage(sessionId, message);

    console.log(`[DB] ${sessionId}: Media message saved from ${message.from}`);
    return
  } catch (error) {
    console.error("Error handling message:", error);
  }
}