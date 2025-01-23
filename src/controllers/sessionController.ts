// import * as qr from "qr-image";
import {
  setupSession,
  deleteSession,
  reloadSession,
  validateSession,
  flushSessions,
  sessions,
} from "../sessions";
import { sendErrorResponse, waitForNestedObject } from "../utils";
import type { Context } from "hono";

/**
 * Starts a session for the given session ID.
 *
 * @param c - The Hono context object
 * @returns Promise resolving to void
 * @throws Error If there was an error starting the session
 */
const startSession = async (c: Context) => {
  // #swagger.summary = 'Start new session'
  // #swagger.description = 'Starts a session for the given session ID.'
  try {
    const sessionId = c.req.param("sessionId");
    console.log(`Starting session ${sessionId}`);
    const setupSessionReturn = setupSession(sessionId);
    console.log(`Setup session return: ${setupSessionReturn.success}`);
    if (!setupSessionReturn.success) {
      /* #swagger.responses[422] = {
        description: "Unprocessable Entity.",
        content: {
          "application/json": {
            schema: { "$ref": "#/definitions/ErrorResponse" }
          }
        }
      }
      */
      return sendErrorResponse(c, 422, setupSessionReturn.message);
    }
    /* #swagger.responses[200] = {
      description: "Status of the initiated session.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/StartSessionResponse" }
        }
      }
    }
    */
    // wait until the client is created
    // wait until the client is created
    // TODO: FIX THIS
    try {
      await waitForNestedObject(setupSessionReturn.client, "pupPage");
      return c.json({ success: true, message: setupSessionReturn.message });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  } catch (error: any) {
    /* #swagger.responses[500] = {
      description: "Server Failure.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/ErrorResponse" }
        }
      }
    }
    */
    console.log("startSession ERROR", error);
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Status of the session with the given session ID.
 *
 * @param c - The Hono context object
 * @returns Promise resolving to void
 * @throws Error If there was an error getting status of the session
 */
const statusSession = async (c: Context) => {
  // #swagger.summary = 'Get session status'
  // #swagger.description = 'Status of the session with the given session ID.'
  try {
    const sessionId = c.req.param("sessionId");
    const sessionData = await validateSession(sessionId);
    /* #swagger.responses[200] = {
      description: "Status of the session.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/StatusSessionResponse" }
        }
      }
    }
    */
    return c.json(sessionData);
  } catch (error: any) {
    console.log("statusSession ERROR", error);
    /* #swagger.responses[500] = {
      description: "Server Failure.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/ErrorResponse" }
        }
      }
    }
    */
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * QR code of the session with the given session ID.
 *
 * @param c - The Hono context object
 * @returns Promise resolving to void
 * @throws Error If there was an error getting status of the session
 */
const sessionQrCode = async (c: Context) => {
  // #swagger.summary = 'Get session QR code'
  // #swagger.description = 'QR code of the session with the given session ID.'
  try {
    const sessionId = c.req.param("sessionId");
    const session = sessions.get(sessionId);
    if (!session) {
      return c.json({ success: false, message: "session_not_found" });
    }
    if (session.qr) {
      return c.json({ success: true, qr: session.qr });
    }
    return c.json({
      success: false,
      message: "qr code not ready or already scanned",
    });
  } catch (error: any) {
    console.log("sessionQrCode ERROR", error);
    /* #swagger.responses[500] = {
      description: "Server Failure.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/ErrorResponse" }
        }
      }
    }
    */
    return sendErrorResponse(c, 500, error.message);
  }
};

// /**
//  * QR code as image of the session with the given session ID.
//  *
//  * @param c - The Hono context object
//  * @returns Promise resolving to void
//  * @throws Error If there was an error getting status of the session
//  */
// const sessionQrCodeImage = async (c: Context) => {
//   try {
//     const sessionId = c.req.param("sessionId");
//     const session = sessions.get(sessionId);

//     if (!session) {
//       return c.json({ success: false, message: "session_not_found" }, 404);
//     }

//     if (session.qr) {
//       // Generate QR image buffer
//       const qrBuffer = await new Promise((resolve, reject) => {
//         qr.image(session.qr, (err: Error, buffer: Buffer) => {
//           if (err) reject(err);
//           resolve(buffer);
//         });
//       });

//       // Return the image with proper headers
//       return new Response(qrBuffer, {
//         headers: {
//           "Content-Type": "image/png",
//         },
//         status: 200,
//       });
//     }

//     return c.json(
//       {
//         success: false,
//         message: "qr code not ready or already scanned",
//       },
//       400
//     );
//   } catch (error: any) {
//     console.log("sessionQrCodeImage ERROR", error);
//     return c.json(
//       {
//         success: false,
//         message: error.message,
//       },
//       500
//     );
//   }
// };

/**
 * Restarts the session with the given session ID.
 *
 * @param c - The Hono context object
 * @returns Promise resolving to void
 * @throws Error If there was an error terminating the session
 */
const restartSession = async (c: Context) => {
  // #swagger.summary = 'Restart session'
  // #swagger.description = 'Restarts the session with the given session ID.'
  try {
    const sessionId = c.req.param("sessionId");
    const validation = await validateSession(sessionId);
    if (validation.message === "session_not_found") {
      return c.json(validation);
    }
    await reloadSession(sessionId);
    /* #swagger.responses[200] = {
      description: "Sessions restarted.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/RestartSessionResponse" }
        }
      }
    }
    */
    return c.json({ success: true, message: "Restarted successfully" });
  } catch (error: any) {
    /* #swagger.responses[500] = {
      description: "Server Failure.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/ErrorResponse" }
        }
      }
    }
    */
    console.log("restartSession ERROR", error);
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Terminates the session with the given session ID.
 *
 * @param c - The Hono context object
 * @returns Promise resolving to void
 * @throws Error If there was an error terminating the session
 */
const terminateSession = async (c: Context) => {
  // #swagger.summary = 'Terminate session'
  // #swagger.description = 'Terminates the session with the given session ID.'
  try {
    const sessionId = c.req.param("sessionId");
    const validation = await validateSession(sessionId);
    if (validation.message === "session_not_found") {
      return c.json(validation);
    }
    await deleteSession(sessionId, validation);
    /* #swagger.responses[200] = {
      description: "Sessions terminated.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/TerminateSessionResponse" }
        }
      }
    }
    */
    return c.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    /* #swagger.responses[500] = {
      description: "Server Failure.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/ErrorResponse" }
        }
      }
    }
    */
    console.log("terminateSession ERROR", error);
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Terminates all inactive sessions.
 *
 * @param c - The Hono context object
 * @returns Promise resolving to void
 * @throws Error If there was an error terminating the sessions
 */
const terminateInactiveSessions = async (c: Context) => {
  // #swagger.summary = 'Terminate inactive sessions'
  // #swagger.description = 'Terminates all inactive sessions.'
  try {
    await flushSessions(true);
    /* #swagger.responses[200] = {
      description: "Sessions terminated.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/TerminateSessionsResponse" }
        }
      }
    }
    */
    return c.json({ success: true, message: "Flush completed successfully" });
  } catch (error: any) {
    /* #swagger.responses[500] = {
      description: "Server Failure.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/ErrorResponse" }
        }
      }
    }
    */
    console.log("terminateInactiveSessions ERROR", error);
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Terminates all sessions.
 *
 * @param c - The Hono context object
 * @returns Promise resolving to void
 * @throws Error If there was an error terminating the sessions
 */
const terminateAllSessions = async (c: Context) => {
  // #swagger.summary = 'Terminate all sessions'
  // #swagger.description = 'Terminates all sessions.'
  try {
    await flushSessions(false);
    /* #swagger.responses[200] = {
      description: "Sessions terminated.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/TerminateSessionsResponse" }
        }
      }
    }
    */
    return c.json({ success: true, message: "Flush completed successfully" });
  } catch (error: any) {
    /* #swagger.responses[500] = {
      description: "Server Failure.",
      content: {
        "application/json": {
          schema: { "$ref": "#/definitions/ErrorResponse" }
        }
      }
    }
    */
    console.log("terminateAllSessions ERROR", error);
    return sendErrorResponse(c, 500, error.message);
  }
};

export {
  startSession,
  statusSession,
  sessionQrCode,
  // sessionQrCodeImage,
  restartSession,
  terminateSession,
  terminateInactiveSessions,
  terminateAllSessions,
};
