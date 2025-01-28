import { Hono } from "hono";
import { some } from "hono/combine";
import { GroupChat, MessageMedia } from "whatsapp-web.js";
import middleware from "../middleware";
import { sessions } from "../sessions";
import { sendErrorResponse } from "../utils";

const groupChatRouter = new Hono();
groupChatRouter.use(middleware.apikey);

groupChatRouter.post(
  "/getClassInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      return c.json({ success: true, chat });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/addParticipants/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, contactIds } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      await chat.addParticipants(contactIds);
      return c.json({ success: true, participants: chat.participants });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/demoteParticipants/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, contactIds } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      await chat.demoteParticipants(contactIds);
      return c.json({ success: true, participants: chat.participants });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/getInviteCode/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      const inviteCode = await chat.getInviteCode();
      return c.json({ success: true, inviteCode });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/leave/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      const outcome = await chat.leave();
      return c.json({ success: true, outcome });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/promoteParticipants/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, contactIds } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      await chat.promoteParticipants(contactIds);
      return c.json({ success: true, participants: chat.participants });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/removeParticipants/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, contactIds } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      await chat.removeParticipants(contactIds);
      return c.json({ success: true, participants: chat.participants });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/revokeInvite/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      const newInviteCode = await chat.revokeInvite();
      return c.json({ success: true, newInviteCode });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/setDescription/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, description } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      const success = await chat.setDescription(description);
      return c.json({ success, chat });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/setInfoAdminsOnly/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, adminsOnly } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      const result = await chat.setInfoAdminsOnly(adminsOnly);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/setMessagesAdminsOnly/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, adminsOnly } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      const result = await chat.setMessagesAdminsOnly(adminsOnly);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/setSubject/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId, subject } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      const success = await chat.setSubject(subject);
      return c.json({ success, chat });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/setPicture/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { pictureMimetype, pictureData, chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const media = new MessageMedia(pictureMimetype, pictureData);
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      const result = await chat.setPicture(media);
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
groupChatRouter.post(
  "/deletePicture/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { chatId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const chat = (await client.getChatById(chatId)) as GroupChat;
      if (!chat.isGroup) {
        throw new Error("The chat is not a group");
      }
      const result = await chat.deletePicture();
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);

export default groupChatRouter;
