import { Hono } from "hono";
import { some } from "hono/combine";
import { Message } from "whatsapp-web.js";
import middleware from "../middleware";
import { ClientWithQR, sessions } from "../sessions";
import { sendErrorResponse } from "../utils";

import { validator as zv } from "hono-openapi/zod";
import { z } from "zod";
import { SessionIdSchema } from "../schemas";

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

const MessageSchema = z.object({
  messageId: z.string(),
  chatId: z.string(),
});

messageRouter.post(
  "/getClassInfo/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", MessageSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;

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
  zv("param", SessionIdSchema),
  zv("json", MessageSchema.extend({ everyone: z.boolean() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId, everyone } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;

      const message = await _getMessageById(client, messageId, chatId);
      if (!message) {
        throw new Error("Message not Found");
      }
      const result = await message.delete(everyone);

      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
messageRouter.post(
  "/downloadMedia/:sessionId",
  zv("param", SessionIdSchema),
  zv("json", MessageSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;
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
  zv("param", SessionIdSchema),
  zv("json", MessageSchema.extend({ destinationChatId: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId, destinationChatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;

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
  zv("param", SessionIdSchema),
  zv("json", MessageSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;
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
  zv("param", SessionIdSchema),
  zv("json", MessageSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;
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
  zv("param", SessionIdSchema),
  zv("json", MessageSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;
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
  zv("param", SessionIdSchema),
  zv("json", MessageSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;
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
  zv("param", SessionIdSchema),
  zv("json", MessageSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;
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
  zv("param", SessionIdSchema),
  zv("json", MessageSchema.extend({ reaction: z.string() })),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId, reaction } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;

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
  zv("param", SessionIdSchema),
  zv(
    "json",
    MessageSchema.extend({ destinationChatId: z.string(), content: z.any() })
  ),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId, destinationChatId, content } =
        c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;

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
  zv("param", SessionIdSchema),
  zv("json", MessageSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;

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
  zv("param", SessionIdSchema),
  zv("json", MessageSchema),
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { messageId, chatId } = c.req.valid("json");
      const { sessionId } = c.req.valid("param");

      const client = sessions.get(sessionId)!;
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
