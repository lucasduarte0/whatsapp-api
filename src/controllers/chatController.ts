import { type Context } from "hono";
import { sessions } from "../sessions";
import { sendErrorResponse } from "../utils";

/**
 * Gets information about a chat using the chatId and sessionId
 * @param c Request object
 * @returns JSON object with the success status and chat information
 * @throws Error if chat is not found or if there is a server error
 */
const getClassInfo = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return sendErrorResponse(c, 404, "Chat not Found");
    }
    return c.json({ success: true, chat });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Clears all messages in a chat.
 * @param c Request object
 * @param sessionId Session ID
 * @param chatId Chat ID to clear messages from
 * @returns Success status and the cleared messages
 * @throws Error if chat is not found or if there is an internal server error
 */
const clearMessages = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return sendErrorResponse(c, 404, "Chat not Found");
    }
    const clearMessages = await chat.clearMessages();
    return c.json({ success: true, clearMessages });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Stops typing or recording in chat immediately.
 * @param c Request object
 * @param sessionId Session ID
 * @param chatId ID of the chat to clear the state for
 * @returns JSON object containing a success flag and the result of clearing the state
 * @throws Error if there was an error while clearing the state
 */
const clearState = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return sendErrorResponse(c, 404, "Chat not Found");
    }
    const clearState = await chat.clearState();
    return c.json({ success: true, clearState });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Delete a chat.
 * @param c Request object
 * @param sessionId Session ID
 * @param chatId ID of the chat to be deleted
 * @returns JSON response indicating whether the chat was deleted successfully
 * @throws Error if there is an error while deleting the chat or if the chat is not found
 */
const deleteChat = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return sendErrorResponse(c, 404, "Chat not Found");
    }
    const deleteChat = await chat.delete();
    return c.json({ success: true, deleteChat });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Fetches messages from a specified chat.
 * @param c Request object
 * @param sessionId Session ID
 * @param chatId ID of the chat from which to fetch messages
 * @param searchOptions Search options to use when fetching messages
 * @returns JSON object containing the success status and fetched messages
 * @throws Error if the chat is not found or there is an error fetching messages
 */
const fetchMessages = async (c: Context) => {
  try {
    const { chatId, searchOptions } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return sendErrorResponse(c, 404, "Chat not Found");
    }
    const messages = await chat.fetchMessages(searchOptions);
    return c.json({ success: true, messages });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Gets the contact for a chat.
 * @param c Request object
 * @param sessionId Session ID
 * @param chatId ID of the chat to get the contact for
 * @returns Promise that resolves with the chat's contact information
 * @throws Error if chat is not found or if there is an error getting the contact information
 */
const getContact = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return sendErrorResponse(c, 404, "Chat not Found");
    }
    const contact = await chat.getContact();
    return c.json({ success: true, contact });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Send a recording state to a WhatsApp chat.
 * @param c Request object
 * @param sessionId Session ID
 * @param chatId ID of the chat to send the recording state to
 * @returns A JSON object containing a success message and the result of the sendStateRecording method
 * @throws A JSON object containing a status code and error message if an error occurs
 */
const sendStateRecording = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return sendErrorResponse(c, 404, "Chat not Found");
    }
    const sendStateRecording = await chat.sendStateRecording();
    return c.json({ success: true, sendStateRecording });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Send a typing state to a WhatsApp chat.
 * @param c Request object
 * @param sessionId Session ID
 * @param chatId ID of the chat to send the typing state to
 * @returns An object containing a success message and the result of the sendStateTyping method
 * @throws An error object containing a status code and error message if an error occurs
 */
const sendStateTyping = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = await client.getChatById(chatId);
    if (!chat) {
      return sendErrorResponse(c, 404, "Chat not Found");
    }
    const sendStateTyping = await chat.sendStateTyping();
    return c.json({ success: true, sendStateTyping });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

export {
  getClassInfo,
  clearMessages,
  clearState,
  deleteChat,
  fetchMessages,
  getContact,
  sendStateRecording,
  sendStateTyping,
};
