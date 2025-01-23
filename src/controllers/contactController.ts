import type { Context } from "hono";
import { sessions } from "../sessions";
import { sendErrorResponse } from "../utils";

/**
 * Retrieves information about a WhatsApp contact by ID.
 *

 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The ID of the current session.
 * @param  c.req.body.contactId - The ID of the contact to retrieve information for.
 * @throws  If there is an error retrieving the contact information.
 * @returns  The contact information object.
 */
const getClassInfo = async (c: Context) => {
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(c, 404, "Contact not Found");
    }
    return c.json({ success: true, result: contact });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Blocks a WhatsApp contact by ID.
 *

 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The ID of the current session.
 * @param  c.req.body.contactId - The ID of the contact to block.
 * @throws  If there is an error blocking the contact.
 * @returns  The result of the blocking operation.
 */
const block = async (c: Context) => {
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(c, 404, "Contact not Found");
    }
    const result = await contact.block();
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the 'About' information of a WhatsApp contact by ID.
 *

 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The ID of the current session.
 * @param  c.req.body.contactId - The ID of the contact to retrieve 'About' information for.
 * @throws  If there is an error retrieving the contact information.
 * @returns  The 'About' information of the contact.
 */
const getAbout = async (c: Context) => {
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(c, 404, "Contact not Found");
    }
    const result = await contact.getAbout();
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the chat information of a contact with a given contactId.
 *
 getChat
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @param  c.req.body.contactId - The ID of the client whose chat information is being retrieved.
 * @throws  If the contact with the given contactId is not found or if there is an error retrieving the chat information.
 * @returns  A promise that resolves with the chat information of the contact.
 */
const getChat = async (c: Context) => {
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(c, 404, "Contact not Found");
    }
    const result = await contact.getChat();
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the formatted number of a contact with a given contactId.
 *
 getFormattedNumber
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @param  c.req.body.contactId - The ID of the client whose chat information is being retrieved.
 * @throws  If the contact with the given contactId is not found or if there is an error retrieving the chat information.
 * @returns  A promise that resolves with the formatted number of the contact.
 */
const getFormattedNumber = async (c: Context) => {
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(c, 404, "Contact not Found");
    }
    const result = await contact.getFormattedNumber();
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the country code of a contact with a given contactId.
 *
 getCountryCode
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @param  c.req.body.contactId - The ID of the client whose chat information is being retrieved.
 * @throws  If the contact with the given contactId is not found or if there is an error retrieving the chat information.
 * @returns  A promise that resolves with the country code of the contact.
 */
const getCountryCode = async (c: Context) => {
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(c, 404, "Contact not Found");
    }
    const result = await contact.getCountryCode();
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the profile picture url of a contact with a given contactId.
 *
 getProfilePicUrl
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @param  c.req.body.contactId - The ID of the client whose chat information is being retrieved.
 * @throws  If the contact with the given contactId is not found or if there is an error retrieving the chat information.
 * @returns  A promise that resolves with the profile picture url of the contact.
 */
const getProfilePicUrl = async (c: Context) => {
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(c, 404, "Contact not Found");
    }
    const result = (await contact.getProfilePicUrl()) || null;
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Unblocks the contact with a given contactId.
 *
 unblock
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @param  c.req.body.contactId - The ID of the client whose contact is being unblocked.
 * @throws  If the contact with the given contactId is not found or if there is an error unblocking the contact.
 * @returns  A promise that resolves with the result of unblocking the contact.
 */
const unblock = async (c: Context) => {
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return sendErrorResponse(c, 404, "Contact not Found");
    }
    const result = await contact.unblock();
    return c.json({ success: true, result });
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

export {
  getClassInfo,
  block,
  getAbout,
  getChat,
  unblock,
  getFormattedNumber,
  getCountryCode,
  getProfilePicUrl,
};
