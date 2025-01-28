import { Hono } from "hono";
import { some } from "hono/combine";
import { Message } from "whatsapp-web.js";
import middleware from "../middleware";
import { ClientWithQR, sessions } from "../sessions";
import { sendErrorResponse } from "../utils";

const messageRouter = new Hono();
messageRouter.use(middleware.apikey);

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

messageRouter.post(
  "/getClassInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/delete/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/downloadMedia/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/forward/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/getInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/getMentions/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/getOrder/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/getPayment/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/getQuotedMessage/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/react/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/reply/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/star/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);
messageRouter.post(
  "/unstar/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
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
  }
);

export default messageRouter;
