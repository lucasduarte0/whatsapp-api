import config from "./config";
import { sendErrorResponse } from "./utils";
import { validateSession } from "./sessions";
import { type Next, type Context } from "hono";
// import { RateLimiterMemory } from "hono/rate-limiter";

const {
  globalApiKey,
  // rateLimitMax,
  // rateLimitWindowMs
} = config;

const apikey = async (c: Context, next: Next) => {
  /*
    #swagger.security = [{
          "apiKeyAuth": []
    }]
  */
  /* #swagger.responses[403] = {
        description: "Forbidden.",
        content: {
          "application/json": {
            schema: { "$ref": "#/definitions/ForbiddenResponse" }
          }
        }
      }
  */
  if (globalApiKey) {
    const apiKey = c.req.header("x-api-key");
    if (!apiKey || apiKey !== globalApiKey) {
      return sendErrorResponse(c, 403, "Invalid API key");
    }
  }
  return await next();
};

const sessionNameValidation = async (c: Context, next: Next) => {
  /*
    #swagger.parameters['sessionId'] = {
      in: 'path',
      description: 'Unique identifier for the session (alphanumeric and - allowed)',
      required: true,
      type: 'string',
      example: 'f8377d8d-a589-4242-9ba6-9486a04ef80c'
    }
  */
  if (!/^[\w-]+$/.test(c.req.param("sessionId"))) {
    /* #swagger.responses[422] = {
        description: "Unprocessable Entity.",
        content: {
          "application/json": {
            schema: { "$ref": "#/definitions/ErrorResponse" }
          }
        }
      }
    */
    return sendErrorResponse(c, 422, "Session should be alphanumerical or -");
  }
  return await next();
};

const sessionValidation = async (c: Context, next: Next) => {
  const validation = await validateSession(c.req.param("sessionId"));
  if (validation.success !== true) {
    /* #swagger.responses[404] = {
        description: "Not Found.",
        content: {
          "application/json": {
            schema: { "$ref": "#/definitions/NotFoundResponse" }
          }
        }
      }
    */
    return sendErrorResponse(c, 404, validation.message);
  }
  return await next();
};

const sessionSwagger = async (_c: Context, next: Next) => {
  /*
    #swagger.tags = ['Session']
  */
  return await next();
};

const clientSwagger = async (_c: Context, next: Next) => {
  /*
    #swagger.tags = ['Client']
  */
  return await next();
};

const contactSwagger = async (_c: Context, next: Next) => {
  /*
    #swagger.tags = ['Contact']
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          contactId: {
            type: 'string',
            description: 'Unique whatsApp identifier for the contact',
            example: '6281288888888@c.us'
          }
        }
      }
    }
  */
  return await next();
};

const messageSwagger = async (_c: Context, next: Next) => {
  /*
    #swagger.tags = ['Message']
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'The Chat id which contains the message',
            example: '6281288888888@c.us'
          },
          messageId: {
            type: 'string',
            description: 'Unique whatsApp identifier for the message',
            example: 'ABCDEF999999999'
          }
        }
      }
    }
  */
  return await next();
};

const chatSwagger = async (_c: Context, next: Next) => {
  /*
    #swagger.tags = ['Chat']
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'Unique whatsApp identifier for the given Chat (either group or personnal)',
            example: '6281288888888@c.us'
          }
        }
      }
    }
  */
  return await next();
};

const groupChatSwagger = async (_c: Context, next: Next) => {
  /*
    #swagger.tags = ['Group Chat']
    #swagger.requestBody = {
      required: true,
      schema: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'Unique whatsApp identifier for the given Chat (either group or personnal)',
            example: '6281288888888@c.us'
          }
        }
      }
    }
  */
  return await next();
};

const middleware = {
  sessionValidation,
  apikey,
  sessionNameValidation,
  sessionSwagger,
  clientSwagger,
  contactSwagger,
  messageSwagger,
  chatSwagger,
  groupChatSwagger,
};

export default middleware;
