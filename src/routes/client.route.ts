import { Hono } from "hono";
import { some } from "hono/combine";
import {
  MessageMedia,
  Buttons,
  List,
  Poll,
  Location,
  MessageTypes,
} from "whatsapp-web.js";
import middleware from "../middleware";
import { sessions } from "../sessions";
import { sendErrorResponse } from "../utils";
import { zValidator as zv } from "@hono/zod-validator";
import { ContentSchema, SessionIdSchema } from "../schemas";
import { z } from "zod";

const clientRouter = new Hono();
clientRouter.use(middleware.apikey);

const SearchMessagesSchema = z.object({
  query: z.string(),
  options: z
    .object({
      chatId: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    })
    .optional(),
});

clientRouter.get(
  "/getClassInfo/:sessionId",
  zv("param", SessionIdSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const sessionInfo = client.info;
      return c.json({ success: true, sessionInfo });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/acceptInvite/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ inviteCode: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { inviteCode } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const acceptInvite = await client.acceptInvite(inviteCode);
      return c.json({ success: true, acceptInvite });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/archiveChat/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ chatId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const result = await client.archiveChat(chatId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/createGroup/:sessionId",
  zv("param", SessionIdSchema),
  zv(
    "json",
    z.object({
      name: z.string(),
      participants: z.union([z.string(), z.array(z.string())]),
    })
  ),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { name, participants } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const response = await client.createGroup(name, participants);
      return c.json({ success: true, response });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getBlockedContacts/:sessionId",
  zv("param", SessionIdSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const blockedContacts = await client.getBlockedContacts();
      return c.json({ success: true, blockedContacts });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getChatById/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ labelId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { labelId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const chats = await client.getChatsByLabelId(labelId);
      return c.json({ success: true, chats });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getChatLabels/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ chatId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const chatLabels = await client.getChatLabels(chatId);
      return c.json({ success: true, chatLabels });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.get(
  "/getChats/:sessionId",
  zv("param", SessionIdSchema),

  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const chats = await client.getChats();
      return c.json({ success: true, chats });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
// TODO: CONTINUE FROM HERE:
clientRouter.post(
  zv("param", SessionIdSchema),
  zv("json", z.object({ labelId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { labelId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const chats = await client.getChatsByLabelId(labelId);
      return c.json({ success: true, chats });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getCommonGroups/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ contactId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const groups = await client.getCommonGroups(contactId);
      return c.json({ success: true, groups });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getContactById/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ contactId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const contact = await client.getContactById(contactId);
      return c.json({ success: true, contact });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.get(
  "/getContacts/:sessionId",
  zv("param", SessionIdSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const contacts = await client.getContacts();
      return c.json({ success: true, contacts });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getInviteInfo/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ inviteCode: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { inviteCode } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const inviteInfo = await client.getInviteInfo(inviteCode);
      return c.json({ success: true, inviteInfo });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getLabelById/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ labelId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { labelId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const label = await client.getLabelById(labelId);
      return c.json({ success: true, label });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getLabels/:sessionId",
  zv("param", SessionIdSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const labels = await client.getLabels();
      return c.json({ success: true, labels });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/addOrRemoveLabels/:sessionId",
  zv("param", SessionIdSchema),
  zv(
    "json",
    z.object({
      labelIds: z.array(z.union([z.string(), z.number()])),
      chatIds: z.array(z.string()),
    })
  ),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { labelIds, chatIds } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const labels = await client.addOrRemoveLabels(labelIds, chatIds);
      return c.json({ success: true, labels });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getNumberId/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ number: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { number } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const result = await client.getNumberId(number);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/isRegisteredUser/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ number: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { number } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const result = await client.isRegisteredUser(number);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/getProfilePicUrl/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ contactId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const result = await client.getProfilePicUrl(contactId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.get(
  "/getState/:sessionId",
  zv("param", SessionIdSchema),
  middleware.sessionValidation,
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const state = await client.getState();
      return c.json({ success: true, state });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/markChatUnread/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ chatId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const mark = await client.markChatUnread(chatId);
      return c.json({ success: true, mark });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/muteChat/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ chatId: z.string(), unmuteDate: z.string().date() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, unmuteDate } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
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
  zv("param", SessionIdSchema),
  zv("json", z.object({ chatId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const result = await client.pinChat(chatId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/searchMessages/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", SearchMessagesSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { query, options } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
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
// Define the messages schema using Zod
const messageSchema = z.object({
  chatId: z.string().nonempty(),
  content: ContentSchema,
  contentType: z.enum([
    "string",
    "MessageMedia",
    "MessageMediaFromURL",
    "Location",
    "Buttons",
    "List",
    "Contact",
    "Poll",
  ]),
  options: z
    .object({
      media: z
        .object({
          mimetype: z.string(),
          data: z.string(),
          filename: z.string().nullable().optional(),
          filesize: z.number().nullable().optional(),
        })
        .optional(),
    })
    .optional(),
});

// Implement the post route with validation
clientRouter.post(
  "/sendMessage/:sessionId",
  zv("json", messageSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, content, contentType, options } = c.req.valid("json");

      const client = sessions.get(c.req.param("sessionId"))!;

      let messageOut;
      // Switch block remains the same as your original implementation
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
          const messageMediaFromURL = await MessageMedia.fromUrl(
            content as string,
            {
              unsafeMime: true,
            }
          );
          messageOut = await client.sendMessage(
            chatId,
            messageMediaFromURL,
            options
          );
          break;
        }
        case "MessageMedia": {
          const msgContent = content as MessageMedia
          const messageMedia = new MessageMedia(
            msgContent.mimetype,
            msgContent.data,
            msgContent.filename,
            msgContent.filesize
          );
          messageOut = await client.sendMessage(chatId, messageMedia, options);
          break;
        }
        case "Location": {
          const msgContent = content as {
            latitude: number;
            longitude: number;
            description?: string;
          };
          const location = new Location(
            msgContent.latitude,
            msgContent.longitude,
            msgContent.description
          );
          messageOut = await client.sendMessage(chatId, location, options);
          break;
        }
        case "Buttons": {
          const msgContent = content as {
            body: string;
            buttons: unknown[];
            title: string;
            footer: string;
          };
          const buttons = new Buttons(
            msgContent.body,
            msgContent.buttons,
            msgContent.title,
            msgContent.footer
          );
          messageOut = await client.sendMessage(chatId, buttons, options);
          break;
        }
        case "List": {
          const msgContent = content as {
            body: string;
            buttonText: string;
            sections: unknown[];
            title: string;
            footer: string;
          };
          const list = new List(
            msgContent.body,
            msgContent.buttonText,
            msgContent.sections,
            msgContent.title,
            msgContent.footer
          );
          messageOut = await client.sendMessage(chatId, list, options);
          break;
        }
        case "Contact": {
          const contactId = (
            content as { contactId: string }
          ).contactId.endsWith("@c.us")
            ? (content as { contactId: string }).contactId
            : `${(content as { contactId: string }).contactId}@c.us`;
          const contact = await client.getContactById(contactId);
          messageOut = await client.sendMessage(chatId, contact, options);
          break;
        }
        case "Poll": {
          const msgContent = content as {
            pollName: string;
            pollOptions: unknown[];
            options: unknown;
          };
          const poll = new Poll(
            msgContent.pollName,
            msgContent.pollOptions,
            msgContent.options
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
      if (error instanceof z.ZodError) {
        // Handle validation errors
        return sendErrorResponse(c, 400, "Validation Error: " + error.message);
      }
      console.log(error);
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/sendPresenceAvailable/:sessionId",
  zv("param", SessionIdSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const presence = await client.sendPresenceAvailable();
      return c.json({ success: true, presence });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/sendPresenceUnavailable/:sessionId",
  zv("param", SessionIdSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const presence = await client.sendPresenceUnavailable();
      return c.json({ success: true, presence });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/sendSeen/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ chatId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
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
  zv("param", SessionIdSchema),
  zv("json", z.object({ chatId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const result = await client.unarchiveChat(chatId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/unmuteChat/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ chatId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
      const result = await client.unmuteChat(chatId);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
clientRouter.post(
  "/unpinChat/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", z.object({ chatId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");
      const client = sessions.get(sessionId)!;
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
