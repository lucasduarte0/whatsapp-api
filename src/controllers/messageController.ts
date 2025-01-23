import type { Context } from "hono";
import { sessions, type ClientWithQR } from "../sessions";
import { sendErrorResponse } from "../utils";
import type { Message } from "whatsapp-web.js";

/**
 * Get message by its ID from a given chat using the provided client.
 * @param client - The chat client.
 * @param messageId - The ID of the message to get.
 * @param chatId - The ID of the chat to search in.
 * @returns - A Promise that resolves with the message object that matches the provided ID, or undefined if no such message exists.
 * @throws - Throws an error if the provided client, message ID or chat ID is invalid.
 */
const _getMessageById = async (
  client: ClientWithQR,
  messageId: string,
  chatId: string
): Promise<Message | undefined> => {
  const chat = await client.getChatById(chatId);
  const messages = await chat.fetchMessages({ limit: 100 });
  const message = messages.find((message) => {
    return message.id.id === messageId;
  });
  return message;
};

/**
 * Gets information about a message's class.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const getClassInfo = async (c: Context) => {
  try {
    const { messageId, chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;

    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    return c.json({ success: true, message });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Deletes a message.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const deleteMessage = async (c: Context) => {
  try {
    const { messageId, chatId, everyone } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const result = await message.delete(
      everyone === "true" || everyone === "1"
    );
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Downloads media from a message.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const downloadMedia = async (c: Context) => {
  try {
    const { messageId, chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const messageMedia = await message.downloadMedia();
    return c.json({ success: true, messageMedia });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Forwards a message to a destination chat.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const forward = async (c: Context) => {
  try {
    const { messageId, chatId, destinationChatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const result = await message.forward(destinationChatId);
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Gets information about a message.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const getInfo = async (c: Context) => {
  try {
    const { messageId, chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const info = await message.getInfo();
    return c.json({ success: true, info });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves a list of contacts mentioned in a specific message.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const getMentions = async (c: Context) => {
  try {
    const { messageId, chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const contacts = await message.getMentions();
    return c.json({ success: true, contacts });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the order information contained in a specific message.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const getOrder = async (c: Context) => {
  try {
    const { messageId, chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const order = await message.getOrder();
    return c.json({ success: true, order });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the payment information from a specific message identified by its ID.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const getPayment = async (c: Context) => {
  try {
    const { messageId, chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const payment = await message.getPayment();
    return c.json({ success: true, payment });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the quoted message information from a specific message identified by its ID.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const getQuotedMessage = async (c: Context) => {
  try {
    const { messageId, chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const quotedMessage = await message.getQuotedMessage();
    return c.json({ success: true, quotedMessage });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * React to a specific message in a chat.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const react = async (c: Context) => {
  try {
    const { messageId, chatId, reaction } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const result = await message.react(reaction);
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Reply to a specific message in a chat.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const reply = async (c: Context) => {
  try {
    const { messageId, chatId, content, destinationChatId } =
      await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const repliedMessage = await message.reply(content, destinationChatId);
    return c.json({ success: true, repliedMessage });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Stars a message by message ID and chat ID.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const star = async (c: Context) => {
  try {
    const { messageId, chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const result = await message.star();
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Unstars a message by message ID and chat ID.
 *
 * @param c - The context object.
 * @returns - A Promise that resolves with no value when the function completes.
 */
const unstar = async (c: Context) => {
  try {
    const { messageId, chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const message = await _getMessageById(client, messageId, chatId);
    if (!message) {
      throw new Error("Message not Found");
    }
    const result = await message.unstar();
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

export {
  getClassInfo,
  deleteMessage,
  downloadMedia,
  forward,
  getInfo,
  getMentions,
  getOrder,
  getPayment,
  getQuotedMessage,
  react,
  reply,
  star,
  unstar,
};
