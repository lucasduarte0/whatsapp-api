import { Hono } from "hono";
import { some } from "hono/combine";
import middleware from "../middleware";
import { sessions } from "../sessions";
import { sendErrorResponse } from "../utils";

const chatRouter = new Hono();
chatRouter.use(middleware.apikey);

chatRouter.post(
  "/getClassInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
chatRouter.post(
  "/clearMessages/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
chatRouter.post(
  "/clearState/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
chatRouter.post(
  "/delete/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
chatRouter.post(
  "/fetchMessages/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
chatRouter.post(
  "/getContact/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
chatRouter.post(
  "/sendStateRecording/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
chatRouter.post(
  "/sendStateTyping/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);

export default chatRouter;
