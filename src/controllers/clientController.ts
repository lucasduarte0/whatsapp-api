import { MessageMedia, Location, Buttons, List, Poll } from "whatsapp-web.js";
import { sessions } from "../sessions";
import { sendErrorResponse } from "../utils";
import type { Context } from "hono";

/**
 * Send a message to a chat using the WhatsApp API
 *
 sendMessage
 * @param  req - The request object containing the request parameters
 * @param  c.req.body - The request body containing the chatId, content, contentType and options
 * @param  c.req.body.chatId - The chat id where the message will be sent
 * @param  c.req.body.content - The message content to be sent, can be a string or an object containing the MessageMedia data
 * @param  c.req.body.contentType - The type of the message content, must be one of the following: 'string', 'MessageMedia', 'MessageMediaFromURL', 'Location', 'Buttons', or 'List'
 * @param  c.req.body.options - Additional options to be passed to the WhatsApp API
 * @param  req.params.sessionId - The id of the WhatsApp session to be used
 * @param  res - The response object
 * @returns  - The response object containing a success flag and the sent message data
 * @throws  - If there is an error while sending the message
 */
const sendMessage = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      '@content': {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              chatId: {
                type: 'string',
                description: 'The Chat id which contains the message (Group or Individual)',
              },
              contentType: {
                type: 'string',
                description: 'The type of message content, must be one of the following: string, MessageMedia, MessageMediaFromURL, Location, Buttons, or List',
              },
              content: {
                type: 'object',
                description: 'The content of the message, can be a string or an object',
              },
              options: {
                type: 'object',
                description: 'The message send options',
              }
            }
          },
          examples: {
            string: { value: { chatId: '6281288888888@c.us', contentType: 'string', content: 'Hello World!' } },
            MessageMedia: { value: { chatId: '6281288888888@c.us', contentType: 'MessageMedia', content: { mimetype: 'image/jpeg', data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', filename: 'image.jpg' } } },
            MessageMediaFromURL: { value: { chatId: '6281288888888@c.us', contentType: 'MessageMediaFromURL', content: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example' } },
            Location: { value: { chatId: '6281288888888@c.us', contentType: 'Location', content: { latitude: -6.2, longitude: 106.8, description: 'Jakarta' } } },
            Buttons: { value: { chatId: '6281288888888@c.us', contentType: 'Buttons', content: { body: 'Hello World!', buttons: [{ body: 'button 1' }], title: 'Hello World!', footer: 'Hello World!' } } },
            List: {
              value: { chatId: '6281288888888@c.us', contentType: 'List', content: { body: 'Hello World!', buttonText: 'Hello World!', sections: [{ title: 'sectionTitle', rows: [{ id: 'customId', title: 'ListItem2', description: 'desc' }, { title: 'ListItem2' }] }], title: 'Hello World!', footer: 'Hello World!' } }
            },
            Contact: {
              value: { chatId: '6281288888888@c.us', contentType: 'Contact', content: { contactId: '6281288888889@c.us' } }
            },
            Poll: {
              value: { chatId: '6281288888888@c.us', contentType: 'Poll', content: { pollName: 'Cats or Dogs?', pollOptions: ['Cats', 'Dogs'], options: { allowMultipleAnswers: true } } }
            },
          }
        }
      }
    }
  */

  try {
    const { chatId, content, contentType, options } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;

    let messageOut;
    switch (contentType) {
      case "string":
        if (options?.media) {
          const media = options.media;
          media.filename = null;
          media.filesize = null;
          options.media = new MessageMedia(
            media.mimetype,
            media.data,
            media.filename,
            media.filesize
          );
        }
        messageOut = await client.sendMessage(chatId, content, options);
        break;
      case "MessageMediaFromURL": {
        const messageMediaFromURL = await MessageMedia.fromUrl(content, {
          unsafeMime: true,
        });
        messageOut = await client.sendMessage(
          chatId,
          messageMediaFromURL,
          options
        );
        break;
      }
      case "MessageMedia": {
        const messageMedia = new MessageMedia(
          content.mimetype,
          content.data,
          content.filename,
          content.filesize
        );
        messageOut = await client.sendMessage(chatId, messageMedia, options);
        break;
      }
      case "Location": {
        const location = new Location(
          content.latitude,
          content.longitude,
          content.description
        );
        messageOut = await client.sendMessage(chatId, location, options);
        break;
      }
      case "Buttons": {
        const buttons = new Buttons(
          content.body,
          content.buttons,
          content.title,
          content.footer
        );
        messageOut = await client.sendMessage(chatId, buttons, options);
        break;
      }
      case "List": {
        const list = new List(
          content.body,
          content.buttonText,
          content.sections,
          content.title,
          content.footer
        );
        messageOut = await client.sendMessage(chatId, list, options);
        break;
      }
      case "Contact": {
        const contactId = content.contactId.endsWith("@c.us")
          ? content.contactId
          : `${content.contactId}@c.us`;
        const contact = await client.getContactById(contactId);
        messageOut = await client.sendMessage(chatId, contact, options);
        break;
      }
      case "Poll": {
        const poll = new Poll(
          content.pollName,
          content.pollOptions,
          content.options
        );
        messageOut = await client.sendMessage(chatId, poll, options);
        break;
      }
      default:
        return sendErrorResponse(
          c,
          404,
          "contentType invalid, must be string, MessageMedia, MessageMediaFromURL, Location, Buttons, List, Contact or Poll"
        );
    }

    c.json({ success: true, message: messageOut });
  } catch (error: any) {
    console.log(error);
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Get session information for a given sessionId
 *
 getClientInfo
 * @param  req - Express request object
 * @param  res - Express response object
 * @param  req.params.sessionId - The sessionId for which the session info is requested
 * @returns  - Response object with session info
 * @throws Will throw an error if session info cannot be retrieved
 */
const getClassInfo = async (c: Context) => {
  try {
    const client = sessions.get(c.req.param("sessionId"))!;
    const sessionInfo = await client.info;
    c.json({ success: true, sessionInfo });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Check if a user is registered on WhatsApp
 *
 isRegisteredUser
 * @param  req - Express request object
 * @param  res - Express response object
 * @param  req.params.sessionId - The sessionId in which the user is registered
 * @param  c.req.body.id - The id of the user to check
 * @returns  - Response object with a boolean indicating whether the user is registered
 * @throws Will throw an error if user registration cannot be checked
 */
const isRegisteredUser = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          number: {
            type: 'string',
            description: 'The number or ID (\"@c.us\" will be automatically appended if not specified)',
            example: '6281288888888'
          },
        }
      },
    }
  */
  try {
    const { number } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.isRegisteredUser(number);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the registered WhatsApp ID for a number
 *
 getNumberId
 * @param  req - Express request object
 * @param  res - Express response object
 * @param  req.params.sessionId - The sessionId in which the user is registered
 * @param  c.req.body.id - The id of the user to check
 * @returns  - Response object with a boolean indicating whether the user is registered
 * @throws Will throw an error if user registration cannot be checked
 */
const getNumberId = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          number: {
            type: 'string',
            description: 'The number or ID (\"@c.us\" will be automatically appended if not specified)',
            example: '6281288888888'
          },
        }
      },
    }
  */
  try {
    const { number } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.getNumberId(number);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Create a group with the given name and participants
 *
 createGroup
 * @param  req - Express request object
 * @param  res - Express response object
 * @param  req.params.sessionId - The sessionId in which to create the group
 * @param  c.req.body.name - The name of the group to create
 * @param {Array} c.req.body.participants - Array of user ids to add to the group
 * @returns  - Response object with information about the created group
 * @throws Will throw an error if group cannot be created
 */
const createGroup = async (c: Context) => {
  try {
    const { name, participants } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const response = await client.createGroup(name, participants);
    c.json({ success: true, response });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Set the status of the user in a given session
 *
 setStatus
 * @param  req - Express request object
 * @param  res - Express response object
 * @param  req.params.sessionId - The sessionId in which to set the status
 * @param  c.req.body.status - The status to set
 * @returns  - Response object indicating success
 * @throws Will throw an error if status cannot be set
 */
const setStatus = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'New status message',
            example: 'I\'m running WhatsApp Web Api'
          },
        }
      },
    }
  */
  try {
    const { status } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    await client.setStatus(status);
    c.json({ success: true });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the contacts of the current session.

 * @param  req - The request object.
 * @param  req.params.sessionId - The session ID associated with the client.
 * @param  res - The response object.
 * @returns  - A Promise that resolves with the retrieved contacts or rejects with an error.
 */
const getContacts = async (c: Context) => {
  try {
    const client = sessions.get(c.req.param("sessionId"))!;
    const contacts = await client.getContacts();
    c.json({ success: true, contacts });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieve all chats for the given session ID.
 *
 * @function
 * @async
 *
 * @param  req - The request object.
 * @param  req.params.sessionId - The session ID.
 * @param  res - The response object.
 *
 * @returns  A Promise that resolves when the operation is complete.
 *
 * @throws  If the operation fails, an error is thrown.
 */
const getChats = async (c: Context) => {
  try {
    const client = sessions.get(c.req.param("sessionId"))!;
    const chats = await client.getChats();
    c.json({ success: true, chats });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Returns the profile picture URL for a given contact ID.
 *

 * @param  req - Express request object.
 * @param  res - Express response object.
 * @param  req.params.sessionId - The ID of the current session.
 * @param  c.req.body.contactId - The ID of the contact to get the profile picture for.
 * @returns  - A Promise that resolves with the profile picture URL.
 * @throws  - If there is an error retrieving the profile picture URL.
 */
const getProfilePictureUrl = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          contactId: {
            type: 'string',
            description: 'The contact ID\'s of profile',
            example: '6281288888888@c.us'
          },
        }
      },
    }
  */
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.getProfilePicUrl(contactId);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Accepts an invite.
 *

 * @param  req - The HTTP request object.
 * @param  c.req.body - The request body.
 * @param  req.params - The request parameters.
 * @param  req.params.sessionId - The ID of the session.
 * @param  res - The HTTP response object.
 * @returns  The response object.
 * @throws  If there is an error while accepting the invite.
 */
const acceptInvite = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          inviteCode: {
            type: 'string',
            description: 'Invitation code',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { inviteCode } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const acceptInvite = await client.acceptInvite(inviteCode);
    c.json({ success: true, acceptInvite });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the version of WhatsApp Web currently being run.
 *
 getWWebVersion
 * @param  req - The HTTP request object.
 * @param  req.params - The request parameters.
 * @param  req.params.sessionId - The ID of the session.
 * @param  res - The HTTP response object.
 * @returns  The response object.
 * @throws  If there is an error while accepting the invite.
 */
const getWWebVersion = async (c: Context) => {
  try {
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.getWWebVersion();
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Archives a chat.
 *

 * @param  req - The HTTP request object.
 * @param  c.req.body - The request body.
 * @param  req.params - The request parameters.
 * @param  req.params.sessionId - The ID of the session.
 * @param  res - The HTTP response object.
 * @returns  The response object.
 * @throws  If there is an error while archiving the chat.
 */
const archiveChat = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.archiveChat(chatId);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Get the list of blocked contacts for the user's client.
 *
 getBlockedContacts
 * @param  req - The request object.
 * @param  req.params.sessionId - The session ID to use for the client.
 * @param  res - The response object.
 * @returns  - A promise that resolves to an object with a success property and an array of blocked contacts.
 * @throws  - Throws an error if the operation fails.
 */
const getBlockedContacts = async (c: Context) => {
  try {
    const client = sessions.get(c.req.param("sessionId"))!;
    const blockedContacts = await client.getBlockedContacts();
    c.json({ success: true, blockedContacts });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Get the chat with the given ID.
 *
 getChatById
 * @param  req - The request object.
 * @param  req.params.sessionId - The session ID to use for the client.
 * @param  c.req.body.chatId - The ID of the chat to get.
 * @param  res - The response object.
 * @returns  - A promise that resolves to an object with a success property and the chat object.
 * @throws  - Throws an error if the operation fails.
 */
const getChatById = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chat = await client.getChatById(chatId);
    c.json({ success: true, chat });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Get the labels for the chat with the given ID.
 *
 getChatLabels
 * @param  req - The request object.
 * @param  req.params.sessionId - The session ID to use for the client.
 * @param  c.req.body.chatId - The ID of the chat to get labels for.
 * @param  res - The response object.
 * @returns  - A promise that resolves to an object with a success property and an array of labels for the chat.
 * @throws  - Throws an error if the operation fails.
 */
const getChatLabels = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chatLabels = await client.getChatLabels(chatId);
    c.json({ success: true, chatLabels });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Get the chats with the given label ID.
 *
 getChatsByLabelId
 * @param  req - The request object.
 * @param  req.params.sessionId - The session ID to use for the client.
 * @param  c.req.body.labelId - The ID of the label to get chats for.
 * @param  res - The response object.
 * @returns  - A promise that resolves to an object with a success property and an array of chats with the given label.
 * @throws  - Throws an error if the operation fails.
 */
const getChatsByLabelId = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          labelId: {
            type: 'string',
            description: 'ID of the label',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { labelId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const chats = await client.getChatsByLabelId(labelId);
    c.json({ success: true, chats });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the common groups between the client's session and the specified contact.
 getCommonGroups
 * @param  req - The request object.
 * @param  req.params.sessionId - The session ID of the client.
 * @param  c.req.body.contactId - The ID of the contact to retrieve the common groups with.
 * @param  res - The response object.
 * @returns  - An object containing a success flag and the retrieved groups.
 * @throws  - If an error occurs while retrieving the common groups.
 */
const getCommonGroups = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          contactId: {
            type: 'string',
            description: 'The whatsapp user\'s ID (_serialized format)',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const groups = await client.getCommonGroups(contactId);
    c.json({ success: true, groups });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the contact with the specified ID.
 getContactById
 * @param  req - The request object.
 * @param  req.params.sessionId - The session ID of the client.
 * @param  c.req.body.contactId - The ID of the contact to retrieve.
 * @param  res - The response object.
 * @returns  - An object containing a success flag and the retrieved contact.
 * @throws  - If an error occurs while retrieving the contact.
 */
const getContactById = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          contactId: {
            type: 'string',
            description: 'The whatsapp user\'s ID',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { contactId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const contact = await client.getContactById(contactId);
    c.json({ success: true, contact });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the invite information for the specified invite code.
 getInviteInfo
 * @param  req - The request object.
 * @param  req.params.sessionId - The session ID of the client.
 * @param  c.req.body.inviteCode - The invite code to retrieve information for.
 * @param  res - The response object.
 * @returns  - An object containing a success flag and the retrieved invite information.
 * @throws  - If an error occurs while retrieving the invite information.
 */
const getInviteInfo = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          inviteCode: {
            type: 'string',
            description: 'Invitation code',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { inviteCode } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const inviteInfo = await client.getInviteInfo(inviteCode);
    c.json({ success: true, inviteInfo });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the label with the given ID for a particular session.

 * @param  req - The request object.
 * @param  req.params.sessionId - The ID of the session to retrieve the label for.
 * @param  c.req.body - The request body object.
 * @param  c.req.body.labelId - The ID of the label to retrieve.
 * @param  res - The response object.
 * @returns 
 * @throws  If there is an error retrieving the label.
 */
const getLabelById = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          labelId: {
            type: 'string',
            description: 'ID of the label',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { labelId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const label = await client.getLabelById(labelId);
    c.json({ success: true, label });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves all labels for a particular session.

 * @param  req - The request object.
 * @param  req.params.sessionId - The ID of the session to retrieve the labels for.
 * @param  res - The response object.
 * @returns 
 * @throws  If there is an error retrieving the labels.
 */
const getLabels = async (c: Context) => {
  try {
    const client = sessions.get(c.req.param("sessionId"))!;
    const labels = await client.getLabels();
    c.json({ success: true, labels });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Adds or removes labels to/from chats.

 * @param  req - the request object
 * @param  res - the response object
 * @return {Promise} a Promise that resolves to the JSON response with success status and labels
 * @throws  if an error occurs
 */
const addOrRemoveLabels = async (c: Context) => {
  /*
  #swagger.requestBody = {
    required: true,
    schema: {
      type: 'object',
      properties: {
        labelIds: {
          type: 'array',
          description: 'Array of label IDs',
          example: []
        },
        chatIds: {
          type: 'array',
          description: 'Array of chat IDs',
          example: []
        },
      }
    },
  }
*/
  try {
    const { labelIds, chatIds } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const labels = await client.addOrRemoveLabels(labelIds, chatIds);
    c.json({ success: true, labels });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Retrieves the state for a particular session.

 * @param  req - The request object.
 * @param  req.params.sessionId - The ID of the session to retrieve the state for.
 * @param  res - The response object.
 * @returns 
 * @throws  If there is an error retrieving the state.
 */
const getState = async (c: Context) => {
  try {
    const client = sessions.get(c.req.param("sessionId"))!;
    const state = await client.getState();
    c.json({ success: true, state });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Marks a chat as unread.
 *
 markChatUnread
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @param  c.req.body.chatId - The ID of the chat to mark as unread.
 * @returns  - A Promise that resolves when the chat is marked as unread.
 * @throws  - If an error occurs while marking the chat as unread.
 */
const markChatUnread = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const mark = await client.markChatUnread(chatId);
    c.json({ success: true, mark });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Mutes a chat.
 *
 muteChat
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @param  c.req.body.chatId - The ID of the chat to mute.
 * @param {Date} [c.req.body.unmuteDate] - The date and time when the chat should be unmuted. If not provided, the chat will be muted indefinitely.
 * @returns  - A Promise that resolves when the chat is muted.
 * @throws  - If an error occurs while muting the chat.
 */
const muteChat = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
          unmuteDate: {
            type: 'string',
            description: 'Date when the chat will be muted, leave as is to mute forever',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId, unmuteDate } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    let mute;
    if (unmuteDate) {
      mute = await client.muteChat(chatId, new Date(unmuteDate));
    } else {
      mute = await client.muteChat(chatId);
    }
    c.json({ success: true, mute });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Pins a chat.
 *
 pinChat
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @param  c.req.body.chatId - The ID of the chat to pin.
 * @returns  - A Promise that resolves when the chat is pinned.
 * @throws  - If an error occurs while pinning the chat.
 */
const pinChat = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.pinChat(chatId);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};
/**
 * Search messages with the given query and options.
 searchMessages
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @param  c.req.body - The request body.
 * @param  c.req.body.query - The search query.
 * @param  [c.req.body.options] - The search options (optional).
 * @returns  - A Promise that resolves with the search results.
 * @throws  - If there's an error during the search.
 */
const searchMessages = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search string',
            example: ''
          },
          options: {
            type: 'object',
            description: 'Search options',
            example: {}
          },
        }
      },
    }
  */
  try {
    const { query, options } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    let messages;
    if (options) {
      messages = await client.searchMessages(query, options);
    } else {
      messages = await client.searchMessages(query);
    }
    c.json({ success: true, messages });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Send presence available to the XMPP server.
 sendPresenceAvailable
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @returns  - A Promise that resolves with the presence status.
 * @throws  - If there's an error during the presence sending.
 */
const sendPresenceAvailable = async (c: Context) => {
  try {
    const client = sessions.get(c.req.param("sessionId"))!;
    const presence = await client.sendPresenceAvailable();
    c.json({ success: true, presence });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Send presence unavailable to the XMPP server.
 sendPresenceUnavailable
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  req.params.sessionId - The session ID.
 * @returns  - A Promise that resolves with the presence status.
 * @throws  - If there's an error during the presence sending.
 */
const sendPresenceUnavailable = async (c: Context) => {
  try {
    const client = sessions.get(c.req.param("sessionId"))!;
    const presence = await client.sendPresenceUnavailable();
    c.json({ success: true, presence });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Send a 'seen' message status for a given chat ID.

 * @param  req - The request object.
 * @param  res - The response object.
 * @param  c.req.body.chatId - The ID of the chat to set the seen status for.
 * @param  req.params.sessionId - The ID of the session for the user.
 * @returns  Returns a JSON object with a success status and the result of the function.
 * @throws  If there is an issue sending the seen status message, an error will be thrown.
 */
const sendSeen = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.sendSeen(chatId);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Set the display name for the user's WhatsApp account.

 * @param  req - The request object.
 * @param  res - The response object.
 * @param  c.req.body.displayName - The new display name to set for the user's WhatsApp account.
 * @param  req.params.sessionId - The ID of the session for the user.
 * @returns  Returns a JSON object with a success status and the result of the function.
 * @throws  If there is an issue setting the display name, an error will be thrown.
 */
const setDisplayName = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            description: 'New display name',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { displayName } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.setDisplayName(displayName);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Unarchive a chat for the user's WhatsApp account.

 * @param  req - The request object.
 * @param  res - The response object.
 * @param  c.req.body.chatId - The ID of the chat to unarchive.
 * @param  req.params.sessionId - The ID of the session for the user.
 * @returns  Returns a JSON object with a success status and the result of the function.
 * @throws  If there is an issue unarchiving the chat, an error will be thrown.
 */
const unarchiveChat = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.unarchiveChat(chatId);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Unmutes the chat identified by chatId using the client associated with the given sessionId.
 *

 * @param  req - The HTTP request object containing the chatId and sessionId.
 * @param  c.req.body.chatId - The unique identifier of the chat to unmute.
 * @param  req.params.sessionId - The unique identifier of the session associated with the client to use.
 * @param  res - The HTTP response object.
 * @returns  - A Promise that resolves with a JSON object containing a success flag and the result of the operation.
 * @throws  - If an error occurs during the operation, it is thrown and handled by the catch block.
 */
const unmuteChat = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.unmuteChat(chatId);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Unpins the chat identified by chatId using the client associated with the given sessionId.
 *

 * @param  req - The HTTP request object containing the chatId and sessionId.
 * @param  c.req.body.chatId - The unique identifier of the chat to unpin.
 * @param  req.params.sessionId - The unique identifier of the session associated with the client to use.
 * @param  res - The HTTP response object.
 * @returns  - A Promise that resolves with a JSON object containing a success flag and the result of the operation.
 * @throws  - If an error occurs during the operation, it is thrown and handled by the catch block.
 */
const unpinChat = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat',
            example: ''
          },
        }
      },
    }
  */
  try {
    const { chatId } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const result = await client.unpinChat(chatId);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

/**
 * update the profile Picture of the session user
 * @param  req - The request object.
 * @param  res - The response object.
 * @param  c.req.body.media - The new profile picture to set for the user's WhatsApp account.
 * @param  req.params.sessionId - The ID of the session for the user.
 * @returns  Returns a JSON object with a success status and the result of the function.
 * @throws  If there is an issue setting the profile picture, an error will be thrown.
 */

const setProfilePicture = async (c: Context) => {
  /*
    #swagger.requestBody = {
      required: true,
      schema: {
        type: "object",
        properties: {
          pictureMimetype: {
            type: "string",
            description: "The mimetype of the picture to set as the profile picture for the user WhatsApp account.",
            example: "image/png"
          },
          pictureData: {
            type: "string",
            description: "The base64 data of the picture to set as the profile picture for the user WhatsApp account.",
            example: "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII="
          }
        }
      }
    }
  */

  try {
    const { pictureMimetype, pictureData } = await c.req.json();
    const client = sessions.get(c.req.param("sessionId"))!;
    const media = new MessageMedia(pictureMimetype, pictureData);
    const result = await client.setProfilePicture(media);
    c.json({ success: true, result });
  } catch (error: any) {
    sendErrorResponse(c, 500, error.message);
  }
};

export {
  getClassInfo,
  acceptInvite,
  archiveChat,
  createGroup,
  getBlockedContacts,
  getChatById,
  getChatLabels,
  getChats,
  getChatsByLabelId,
  getCommonGroups,
  getContactById,
  getContacts,
  getInviteInfo,
  getLabelById,
  getLabels,
  addOrRemoveLabels,
  isRegisteredUser,
  getNumberId,
  getProfilePictureUrl,
  getState,
  markChatUnread,
  muteChat,
  pinChat,
  searchMessages,
  sendMessage,
  sendPresenceAvailable,
  sendPresenceUnavailable,
  sendSeen,
  setDisplayName,
  setProfilePicture,
  setStatus,
  unarchiveChat,
  unmuteChat,
  unpinChat,
  getWWebVersion,
};
