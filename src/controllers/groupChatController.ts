import type { Context } from "hono";
import { sessions } from "../sessions";
import { sendErrorResponse } from "../utils";
import { MessageMedia, type GroupChat } from "whatsapp-web.js";
/**
 * Adds participants to a group chat.

 * @param  req - The request object containing the chatId and contactIds in the body.
 * @param  c.req.body.chatId - The ID of the group chat.
 * @param  c.req.body.contactIds - An array of contact IDs to be added to the group.
 * @param  res - The response object.
 * @returns  Returns a JSON object containing a success flag and the updated participants list.
 * @throws  Throws an error if the chat is not a group chat.
 */
const addParticipants = async (c: Context) => {
  try {
    const { chatId, contactIds } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    await chat.addParticipants(contactIds);
    c.json({ success: true, participants: chat.participants });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Removes participants from a group chat
 *

 * @param  req - Express request object
 * @param  res - Express response object
 * @returns  Returns a JSON object with success flag and updated participants list
 * @throws  If chat is not a group
 */
const removeParticipants = async (c: Context) => {
  try {
    const { chatId, contactIds } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    await chat.removeParticipants(contactIds);
    c.json({ success: true, participants: chat.participants });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Promotes participants in a group chat to admin
 *

 * @param  req - Express request object
 * @param  res - Express response object
 * @returns  Returns a JSON object with success flag and updated participants list
 * @throws  If chat is not a group
 */
const promoteParticipants = async (c: Context) => {
  try {
    const { chatId, contactIds } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    await chat.promoteParticipants(contactIds);
    c.json({ success: true, participants: chat.participants });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Demotes admin participants in a group chat
 *

 * @param  req - Express request object
 * @param  res - Express response object
 * @returns  Returns a JSON object with success flag and updated participants list
 * @throws  If chat is not a group
 */
const demoteParticipants = async (c: Context) => {
  try {
    const { chatId, contactIds } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    await chat.demoteParticipants(contactIds);
    c.json({ success: true, participants: chat.participants });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Gets the invite code for a group chat
 *

 * @param  req - Express request object
 * @param  res - Express response object
 * @returns  Returns a JSON object with success flag and invite code
 * @throws  If chat is not a group
 */
const getInviteCode = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    const inviteCode = await chat.getInviteCode();
    c.json({ success: true, inviteCode });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Sets the subject of a group chat
 *

 * @param  req - Express request object
 * @param  res - Express response object
 * @returns  Returns a JSON object with success flag and updated chat object
 * @throws  If chat is not a group
 */
const setSubject = async (c: Context) => {
  try {
    const { chatId, subject } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    const success = await chat.setSubject(subject);
    c.json({ success, chat });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Sets the description of a group chat
 *

 * @param  req - Express request object
 * @param  res - Express response object
 * @returns  Returns a JSON object with success flag and updated chat object
 * @throws  If chat is not a group
 */
const setDescription = async (c: Context) => {
  try {
    const { chatId, description } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    const success = await chat.setDescription(description);
    c.json({ success, chat });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Leaves a group chat
 *

 * @param  req - Express request object
 * @param  res - Express response object
 * @returns  Returns a JSON object with success flag and outcome of leaving the chat
 * @throws  If chat is not a group
 */
const leave = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    const outcome = await chat.leave();
    c.json({ success: true, outcome });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves information about a chat based on the provided chatId
 *
 getClassInfo
 * @param  req - The request object
 * @param  res - The response object
 * @param  c.req.body.chatId - The chatId of the chat to retrieve information about
 * @param  req.params.sessionId - The sessionId of the client making the request
 * @throws  The chat is not a group.
 * @returns  - A JSON response with success true and chat object containing chat information
 */
const getClassInfo = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    c.json({ success: true, chat });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Revokes the invite link for a group chat based on the provided chatId
 *
 revokeInvite
 * @param  req - The request object
 * @param  res - The response object
 * @param  c.req.body.chatId - The chatId of the group chat to revoke the invite for
 * @param  req.params.sessionId - The sessionId of the client making the request
 * @throws  The chat is not a group.
 * @returns  - A JSON response with success true and the new invite code for the group chat
 */
const revokeInvite = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    const newInviteCode = await chat.revokeInvite();
    c.json({ success: true, newInviteCode });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Sets admins-only status of a group chat's info or messages.
 *
 setInfoAdminsOnly
 * @param  req - Request object.
 * @param  res - Response object.
 * @param  req.params.sessionId - ID of the user's session.
 * @param  c.req.body - Request body.
 * @param  c.req.body.chatId - ID of the group chat.
 * @param {boolean} c.req.body.adminsOnly - Desired admins-only status.
 * @returns  Promise representing the success or failure of the operation.
 * @throws  If the chat is not a group.
 */
const setInfoAdminsOnly = async (c: Context) => {
  try {
    const { chatId, adminsOnly } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    const result = await chat.setInfoAdminsOnly(adminsOnly);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Sets admins-only status of a group chat's messages.
 *
 setMessagesAdminsOnly
 * @param  req - Request object.
 * @param  res - Response object.
 * @param  req.params.sessionId - ID of the user's session.
 * @param  c.req.body - Request body.
 * @param  c.req.body.chatId - ID of the group chat.
 * @param {boolean} c.req.body.adminsOnly - Desired admins-only status.
 * @returns  Promise representing the success or failure of the operation.
 * @throws  If the chat is not a group.
 */
const setMessagesAdminsOnly = async (c: Context) => {
  try {
    const { chatId, adminsOnly } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    const result = await chat.setMessagesAdminsOnly(adminsOnly);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Set the group Picture
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  c.req.body.pictureMimetype - The mimetype of the image.
 * @param  c.req.body.pictureData - The new group picture in base64 format.
 * @param  c.req.body.chatId - ID of the group chat.
 * @param  req.params.sessionId - The ID of the session for the user.
 * @returns  Returns a JSON object with a success status and the result of the function.
 * @throws  If there is an issue setting the group picture, an error will be thrown.
 */
const setPicture = async (c: Context) => {
  try {
    const { pictureMimetype, pictureData, chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const media = new MessageMedia(pictureMimetype, pictureData);
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    const result = await chat.setPicture(media);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Delete the group Picture
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  c.req.body.chatId - ID of the group chat.
 * @param  req.params.sessionId - The ID of the session for the user.
 * @returns  Returns a JSON object with a success status and the result of the function.
 * @throws  If there is an issue setting the group picture, an error will be thrown.
 */
const deletePicture = async (c: Context) => {
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = (await client.getChatById(chatId)) as GroupChat;
    if (!chat.isGroup) {
      throw new Error("The chat is not a group");
    }
    const result = await chat.deletePicture();
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

export {
  getClassInfo,
  addParticipants,
  demoteParticipants,
  getInviteCode,
  leave,
  promoteParticipants,
  removeParticipants,
  revokeInvite,
  setDescription,
  setInfoAdminsOnly,
  setMessagesAdminsOnly,
  setSubject,
  setPicture,
  deletePicture,
};
