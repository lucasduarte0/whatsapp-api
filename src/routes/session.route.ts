import { Hono } from "hono";
import middleware from "../middleware";
import {
  setupSession,
  validateSession,
  sessions,
  reloadSession,
  deleteSession,
  flushSessions,
} from "../sessions";
import { sendErrorResponse, waitForNestedObject } from "../utils";
import { resolver, validator as zv } from "hono-openapi/zod";
import { z } from "zod";
import { describeRoute } from "hono-openapi";
import type { Context } from "hono";
import { StatusCode } from "hono/utils/http-status";

const sessionRouter = new Hono();
sessionRouter.use(middleware.apikey);

const SessionIdSchema = z.object({
  sessionId: z.string().min(3),
});

// Reusable error handling function
const handleError = (c: Context, status: StatusCode, message: any) => {
  console.log(message);
  return sendErrorResponse(c, status, message);
};

// Reusable describeRoute errors
const errorResponses = {
  422: {
    description: "Unprocessable Entity",
    content: {
      "application/json": {
        schema: resolver(
          z.object({ success: z.boolean(), message: z.string() })
        ),
      },
    },
  },
  500: {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: resolver(
          z.object({ success: z.boolean(), message: z.string() })
        ),
      },
    },
  },
};

sessionRouter.get(
  "/start/:sessionId",
  describeRoute({
    description: "Start a session with the given sessionId",
    responses: {
      200: {
        description: "Session started successfully",
        content: {
          "application/json": {
            schema: resolver(
              z.object({ success: z.boolean(), message: z.string() })
            ),
          },
        },
      },
      ...errorResponses,
    },
  }),
  zv("param", SessionIdSchema),
  middleware.sessionNameValidation,
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      console.log(`Starting session ${sessionId}`);
      const setupSessionReturn = setupSession(sessionId);
      console.log(`Setup session return: ${setupSessionReturn.success}`);
      if (!setupSessionReturn.success) {
        return handleError(c, 422, setupSessionReturn.message);
      }
      try {
        await waitForNestedObject(setupSessionReturn.client, "pupPage");
        return c.json({ success: true, message: setupSessionReturn.message });
      } catch (error: any) {
        return handleError(c, 500, error.message);
      }
    } catch (error: any) {
      return handleError(c, 500, error.message);
    }
  }
);

sessionRouter.get(
  "/status/:sessionId",
  describeRoute({
    description: "Get the status of a session by sessionId",
    responses: {
      200: {
        description: "Session status retrieved successfully",
        content: {
          "application/json": {
            schema: resolver(z.object({ success: z.boolean(), data: z.any() })),
          },
        },
      },
      ...errorResponses,
    },
  }),
  zv("param", SessionIdSchema),
  middleware.sessionNameValidation,
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const sessionData = await validateSession(sessionId);

      return c.json(sessionData);
    } catch (error: any) {
      return handleError(c, 500, error.message);
    }
  }
);

sessionRouter.get(
  "/qr/:sessionId",
  describeRoute({
    description: "Retrieve QR code for a session",
    responses: {
      200: {
        description: "QR code retrieved successfully",
        content: {
          "application/json": {
            schema: resolver(
              z.object({ success: z.boolean(), qr: z.string().optional() })
            ),
          },
        },
      },
      ...errorResponses,
    },
  }),
  zv("param", SessionIdSchema),
  middleware.sessionNameValidation,
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const session = sessions.get(sessionId);
      if (!session) {
        return c.json({ success: false, message: "session_not_found" });
      }
      if (session.qr) {
        return c.json({ success: true, qr: session.qr });
      }
      return c.json({
        success: false,
        message: "QR code not ready or already scanned",
      });
    } catch (error: any) {
      return handleError(c, 500, error.message);
    }
  }
);

sessionRouter.get(
  "/restart/:sessionId",
  describeRoute({
    description: "Restart a session",
    responses: {
      200: {
        description: "Session restarted successfully",
        content: {
          "application/json": {
            schema: resolver(
              z.object({ success: z.boolean(), message: z.string() })
            ),
          },
        },
      },
      ...errorResponses,
    },
  }),
  zv("param", SessionIdSchema),
  middleware.sessionNameValidation,
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const validation = await validateSession(sessionId);
      if (validation.message === "session_not_found") {
        return c.json(validation);
      }
      await reloadSession(sessionId);

      return c.json({ success: true, message: "Restarted successfully" });
    } catch (error: any) {
      return handleError(c, 500, error.message);
    }
  }
);

sessionRouter.get(
  "/terminate/:sessionId",
  describeRoute({
    description: "Terminate a session",
    responses: {
      200: {
        description: "Session terminated successfully",
        content: {
          "application/json": {
            schema: resolver(
              z.object({ success: z.boolean(), message: z.string() })
            ),
          },
        },
      },
      ...errorResponses,
    },
  }),
  zv("param", SessionIdSchema),
  middleware.sessionNameValidation,
  async (c) => {
    try {
      const { sessionId } = c.req.valid("param");
      const validation = await validateSession(sessionId);
      if (validation.message === "session_not_found") {
        return c.json(validation);
      }
      await deleteSession(sessionId, validation);

      return c.json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
      return handleError(c, 500, error.message);
    }
  }
);

sessionRouter.get(
  "/terminateInactive",
  describeRoute({
    description: "Terminate all inactive sessions",
    responses: {
      200: {
        description: "Inactive sessions terminated successfully",
        content: {
          "application/json": {
            schema: resolver(
              z.object({ success: z.boolean(), message: z.string() })
            ),
          },
        },
      },
      ...errorResponses,
    },
  }),
  async (c) => {
    try {
      await flushSessions(true);

      return c.json({ success: true, message: "Flush completed successfully" });
    } catch (error: any) {
      return handleError(c, 500, error.message);
    }
  }
);

sessionRouter.get(
  "/terminateAll",
  describeRoute({
    description: "Terminate all sessions",
    responses: {
      200: {
        description: "All sessions terminated successfully",
        content: {
          "application/json": {
            schema: resolver(
              z.object({ success: z.boolean(), message: z.string() })
            ),
          },
        },
      },
      ...errorResponses,
    },
  }),
  async (c) => {
    try {
      await flushSessions(false);

      return c.json({ success: true, message: "Flush completed successfully" });
    } catch (error: any) {
      return handleError(c, 500, error.message);
    }
  }
);

export default sessionRouter;
