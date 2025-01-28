import { Hono } from "hono";
import { some } from "hono/combine";
import { MessageMedia, Buttons, List, Poll, Location } from "whatsapp-web.js";
import middleware from "../middleware";
import { sessions } from "../sessions";
import { sendErrorResponse } from "../utils";

const clientRouter = new Hono();
clientRouter.use(middleware.apikey);

clientRouter.get(
  "/getClassInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const client = sessions.get(c.req.param("sessionId"))!;
      const sessionInfo = await client.info;
      return c.json({ success: true, sessionInfo });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/acceptInvite/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { inviteCode } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const acceptInvite = await client.acceptInvite(inviteCode);
      return c.json({ success: true, acceptInvite });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/archiveChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.archiveChat(chatId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/createGroup/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { name, participants } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const response = await client.createGroup(name, participants);
      return c.json({ success: true, response });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getBlockedContacts/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const client = sessions.get(c.req.param("sessionId"))!;
      const blockedContacts = await client.getBlockedContacts();
      return c.json({ success: true, blockedContacts });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getChatById/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { labelId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chats = await client.getChatsByLabelId(labelId);
      return c.json({ success: true, chats });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getChatLabels/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chatLabels = await client.getChatLabels(chatId);
      return c.json({ success: true, chatLabels });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.get(
  "/getChats/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const client = sessions.get(c.req.param("sessionId"))!;
      const chats = await client.getChats();
      return c.json({ success: true, chats });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getChatsByLabelId/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { labelId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chats = await client.getChatsByLabelId(labelId);
      return c.json({ success: true, chats });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getCommonGroups/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const groups = await client.getCommonGroups(contactId);
      return c.json({ success: true, groups });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getContactById/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const contact = await client.getContactById(contactId);
      return c.json({ success: true, contact });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.get(
  "/getContacts/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const client = sessions.get(c.req.param("sessionId"))!;
      const contacts = await client.getContacts();
      return c.json({ success: true, contacts });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getInviteInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { inviteCode } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const inviteInfo = await client.getInviteInfo(inviteCode);
      return c.json({ success: true, inviteInfo });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getLabelById/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { labelId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const label = await client.getLabelById(labelId);
      return c.json({ success: true, label });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getLabels/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const client = sessions.get(c.req.param("sessionId"))!;
      const labels = await client.getLabels();
      return c.json({ success: true, labels });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/addOrRemoveLabels/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { labelIds, chatIds } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const labels = await client.addOrRemoveLabels(labelIds, chatIds);
      return c.json({ success: true, labels });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getNumberId/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { number } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.getNumberId(number);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/isRegisteredUser/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { number } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.isRegisteredUser(number);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getProfilePicUrl/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.getProfilePicUrl(contactId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.get(
  "/getState/:sessionId",
  middleware.sessionNameValidation,
  async (c) => {
    try {
      const client = sessions.get(c.req.param("sessionId"))!;
      const state = await client.getState();
      return c.json({ success: true, state });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/markChatUnread/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const mark = await client.markChatUnread(chatId);
      return c.json({ success: true, mark });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/muteChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, unmuteDate } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      let mute;
      if (unmuteDate) {
        mute = await client.muteChat(chatId, new Date(unmuteDate));
      } else {
        mute = await client.muteChat(chatId);
      }
      return c.json({ success: true, mute });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/pinChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.pinChat(chatId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/searchMessages/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { query, options } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      let messages;
      if (options) {
        messages = await client.searchMessages(query, options);
      } else {
        messages = await client.searchMessages(query);
      }
      return c.json({ success: true, messages });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/sendMessage/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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

      return c.json({ success: true, message: messageOut });
    } catch (error: any) {
      console.log(error);
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/sendPresenceAvailable/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const client = sessions.get(c.req.param("sessionId"))!;
      const presence = await client.sendPresenceAvailable();
      return c.json({ success: true, presence });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/sendPresenceUnavailable/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const client = sessions.get(c.req.param("sessionId"))!;
      const presence = await client.sendPresenceUnavailable();
      return c.json({ success: true, presence });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/sendSeen/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.sendSeen(chatId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/setDisplayName/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { displayName } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.setDisplayName(displayName);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/setProfilePicture/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { pictureMimetype, pictureData } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const media = new MessageMedia(pictureMimetype, pictureData);
      const result = await client.setProfilePicture(media);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/setStatus/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { status } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      await client.setStatus(status);
      return c.json({ success: true });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/unarchiveChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.unarchiveChat(chatId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/unmuteChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.unmuteChat(chatId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/unpinChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.unpinChat(chatId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.get(
  "/getWWebVersion/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const client = sessions.get(c.req.param("sessionId"))!;
      const result = await client.getWWebVersion();
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);

export default clientRouter;