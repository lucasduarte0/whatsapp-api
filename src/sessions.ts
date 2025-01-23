import { Client, LocalAuth } from "whatsapp-web.js";
import * as fs from "fs";
import * as path from "path";

const sessions: Map<string, WAWebJS.Client> = new Map();

import config from "./config";
const {
  baseWebhookURL,
  sessionFolderPath,
  maxAttachmentSize,
  setMessagesAsSeen,
  webVersion,
  webVersionCacheType,
  recoverSessions,
} = config;

import {
  triggerWebhook,
  waitForNestedObject,
  checkIfEventisEnabled,
} from "./utils";
import WAWebJS = require("whatsapp-web.js");

// Session Validation Types
type SessionValidation = {
  success: boolean;
  state: WAWebJS.WAState | null;
  message: string;
};

// Function to validate if the session is ready
const validateSession = async (
  sessionId: string
): Promise<SessionValidation> => {
  try {
    // Session not Connected 😢
    if (!sessions.has(sessionId) || !sessions.get(sessionId)) {
      return {
        success: false,
        state: null,
        message: "session_not_found",
      };
    }

    const client = sessions.get(sessionId) as WAWebJS.Client;
    // wait until the client is created
    await waitForNestedObject(client, "pupPage").catch((err) => {
      return { success: false, state: null, message: err.message };
    });

    // Wait for client.pupPage to be evaluable
    let maxRetry = 0;
    while (true) {
      try {
        if (client.pupPage?.isClosed()) {
          return { success: false, state: null, message: "browser tab closed" };
        }
        await Promise.race([
          client.pupPage?.evaluate("1"),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
        break;
      } catch {
        if (maxRetry === 2) {
          return { success: false, state: null, message: "session closed" };
        }
        maxRetry++;
      }
    }

    const state = await client.getState();

    if (state !== "CONNECTED") {
      return {
        success: false,
        state,
        message: "session_not_connected",
      };
    }

    // Session Connected 🎉
    return {
      success: true,
      state,
      message: "session_connected",
    };
  } catch (error: any) {
    console.log(error);
    return { success: false, state: null, message: error.message };
  }
};

// Function to handle client session restoration
const restoreSessions = () => {
  try {
    if (!fs.existsSync(sessionFolderPath)) {
      fs.mkdirSync(sessionFolderPath); // Create the session directory if it doesn't exist
    }
    // Read the contents of the folder
    fs.readdir(sessionFolderPath, (_, files) => {
      // Iterate through the files in the parent folder
      for (const file of files) {
        // Use regular expression to extract the string from the folder name
        const match = file.match(/^session-(.+)$/);
        if (match) {
          const sessionId = match[1];
          console.log("existing session detected", sessionId);
          setupSession(sessionId);
        }
      }
    });
  } catch (error: any) {
    console.log(error);
    console.error("Failed to restore sessions:", error);
  }
};

// Setup Session
const setupSession = (sessionId: string) => {
  try {
    if (sessions.has(sessionId)) {
      return {
        success: false,
        message: `Session already exists for: ${sessionId}`,
        client: sessions.get(sessionId),
      };
    }

    // Disable the delete folder from the logout function (will be handled separately)
    const localAuth = new LocalAuth({
      clientId: sessionId,
      dataPath: sessionFolderPath,
    });
    // TODO: Check this
    // delete localAuth.logout;
    // localAuth.logout = () => {};

    const clientOptions: WAWebJS.ClientOptions = {
      puppeteer: {
        executablePath: process.env.CHROME_BIN || undefined,
        // headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage",
        ],
      },
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      authStrategy: localAuth,
    };

    if (webVersion) {
      clientOptions.webVersion = webVersion;
      switch (webVersionCacheType.toLowerCase()) {
        case "local":
          clientOptions.webVersionCache = {
            type: "local",
          };
          break;
        case "remote":
          clientOptions.webVersionCache = {
            type: "remote",
            remotePath:
              "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/" +
              webVersion +
              ".html",
          };
          break;
        default:
          clientOptions.webVersionCache = {
            type: "none",
          };
      }
    }

    const client = new Client(clientOptions);

    client
      .initialize()
      .catch((err) => console.log("Initialize error:", err.message));

    initializeEvents(client, sessionId);

    // Save the session to the Map
    sessions.set(sessionId, client);
    return { success: true, message: "Session initiated successfully", client };
  } catch (error: any) {
    return { success: false, message: error.message, client: null };
  }
};

const initializeEvents = (client: WAWebJS.Client, sessionId: string) => {
  // check if the session webhook is overridden
  const sessionWebhook =
    process.env[sessionId.toUpperCase() + "_WEBHOOK_URL"] || baseWebhookURL;

  if (recoverSessions) {
    waitForNestedObject(client, "pupPage")
      .then(() => {
        const restartSession = async (sessionId: string) => {
          sessions.delete(sessionId);
          await client.destroy().catch((e) => {});
          setupSession(sessionId);
        };
        client.pupPage?.once("close", function () {
          // emitted when the page closes
          console.log(`Browser page closed for ${sessionId}. Restoring`);
          restartSession(sessionId);
        });
        client.pupPage?.once("error", function () {
          // emitted when the page crashes
          console.log(
            `Error occurred on browser page for ${sessionId}. Restoring`
          );
          restartSession(sessionId);
        });
      })
      .catch((e) => {});
  }

  checkIfEventisEnabled("auth_failure").then((_) => {
    client.on("auth_failure", (msg) => {
      triggerWebhook(sessionWebhook, sessionId, "status", { msg });
    });
  });

  checkIfEventisEnabled("authenticated").then((_) => {
    client.on("authenticated", () => {
      triggerWebhook(sessionWebhook, sessionId, "authenticated");
    });
  });

  checkIfEventisEnabled("call").then((_) => {
    client.on("call", async (call) => {
      triggerWebhook(sessionWebhook, sessionId, "call", { call });
    });
  });

  checkIfEventisEnabled("change_state").then((_) => {
    client.on("change_state", (state) => {
      triggerWebhook(sessionWebhook, sessionId, "change_state", { state });
    });
  });

  checkIfEventisEnabled("disconnected").then((_) => {
    client.on("disconnected", (reason) => {
      triggerWebhook(sessionWebhook, sessionId, "disconnected", { reason });
    });
  });

  checkIfEventisEnabled("group_join").then((_) => {
    client.on("group_join", (notification) => {
      triggerWebhook(sessionWebhook, sessionId, "group_join", { notification });
    });
  });

  checkIfEventisEnabled("group_leave").then((_) => {
    client.on("group_leave", (notification) => {
      triggerWebhook(sessionWebhook, sessionId, "group_leave", {
        notification,
      });
    });
  });

  checkIfEventisEnabled("group_update").then((_) => {
    client.on("group_update", (notification) => {
      triggerWebhook(sessionWebhook, sessionId, "group_update", {
        notification,
      });
    });
  });

  checkIfEventisEnabled("loading_screen").then((_) => {
    client.on("loading_screen", (percent, message) => {
      triggerWebhook(sessionWebhook, sessionId, "loading_screen", {
        percent,
        message,
      });
    });
  });

  checkIfEventisEnabled("media_uploaded").then((_) => {
    client.on("media_uploaded", (message) => {
      triggerWebhook(sessionWebhook, sessionId, "media_uploaded", { message });
    });
  });

  checkIfEventisEnabled("message").then((_) => {
    client.on("message", async (message) => {
      triggerWebhook(sessionWebhook, sessionId, "message", { message });
      if (message.hasMedia) {
        // custom service event
        checkIfEventisEnabled("media").then((_) => {
          message
            .downloadMedia()
            .then((messageMedia) => {
              triggerWebhook(sessionWebhook, sessionId, "media", {
                messageMedia,
                message,
              });
            })
            .catch((e) => {
              console.log("Download media error:", e.message);
            });
        });
      }
      if (setMessagesAsSeen) {
        const chat = await message.getChat();
        chat.sendSeen();
      }
    });
  });

  checkIfEventisEnabled("message_ack").then((_) => {
    client.on("message_ack", async (message, ack) => {
      triggerWebhook(sessionWebhook, sessionId, "message_ack", {
        message,
        ack,
      });
      if (setMessagesAsSeen) {
        const chat = await message.getChat();
        chat.sendSeen();
      }
    });
  });

  checkIfEventisEnabled("message_create").then((_) => {
    client.on("message_create", async (message) => {
      triggerWebhook(sessionWebhook, sessionId, "message_create", { message });
      if (setMessagesAsSeen) {
        const chat = await message.getChat();
        chat.sendSeen();
      }
    });
  });

  checkIfEventisEnabled("message_reaction").then((_) => {
    client.on("message_reaction", (reaction) => {
      triggerWebhook(sessionWebhook, sessionId, "message_reaction", {
        reaction,
      });
    });
  });

  checkIfEventisEnabled("message_edit").then((_) => {
    client.on("message_edit", (message, newBody, prevBody) => {
      triggerWebhook(sessionWebhook, sessionId, "message_edit", {
        message,
        newBody,
        prevBody,
      });
    });
  });

  checkIfEventisEnabled("message_ciphertext").then((_) => {
    client.on("message_ciphertext", (message) => {
      triggerWebhook(sessionWebhook, sessionId, "message_ciphertext", {
        message,
      });
    });
  });

  checkIfEventisEnabled("message_revoke_everyone").then((_) => {
    // eslint-disable-next-line camelcase
    client.on("message_revoke_everyone", async (message) => {
      // eslint-disable-next-line camelcase
      triggerWebhook(sessionWebhook, sessionId, "message_revoke_everyone", {
        message,
      });
    });
  });

  checkIfEventisEnabled("message_revoke_me").then((_) => {
    client.on("message_revoke_me", async (message) => {
      triggerWebhook(sessionWebhook, sessionId, "message_revoke_me", {
        message,
      });
    });
  });

  client.on("qr", (qr) => {
    // inject qr code into session
    // client.qr = qr;
    checkIfEventisEnabled("qr").then((_) => {
      triggerWebhook(sessionWebhook, sessionId, "qr", { qr });
    });
  });

  checkIfEventisEnabled("ready").then((_) => {
    client.on("ready", () => {
      triggerWebhook(sessionWebhook, sessionId, "ready");
    });
  });

  checkIfEventisEnabled("contact_changed").then((_) => {
    client.on("contact_changed", async (message, oldId, newId, isContact) => {
      triggerWebhook(sessionWebhook, sessionId, "contact_changed", {
        message,
        oldId,
        newId,
        isContact,
      });
    });
  });

  checkIfEventisEnabled("chat_removed").then((_) => {
    client.on("chat_removed", async (chat) => {
      triggerWebhook(sessionWebhook, sessionId, "chat_removed", { chat });
    });
  });

  checkIfEventisEnabled("chat_archived").then((_) => {
    client.on("chat_archived", async (chat, currState, prevState) => {
      triggerWebhook(sessionWebhook, sessionId, "chat_archived", {
        chat,
        currState,
        prevState,
      });
    });
  });

  checkIfEventisEnabled("unread_count").then((_) => {
    client.on("unread_count", async (chat) => {
      triggerWebhook(sessionWebhook, sessionId, "unread_count", { chat });
    });
  });
};

// Function to delete client session folder
const deleteSessionFolder = async (sessionId: string) => {
  try {
    const targetDirPath = path.join(sessionFolderPath, `session-${sessionId}`);
    const resolvedTargetDirPath = await fs.promises.realpath(targetDirPath);
    const resolvedSessionPath = await fs.promises.realpath(sessionFolderPath);

    // Ensure the target directory path ends with a path separator
    const safeSessionPath = `${resolvedSessionPath}${path.sep}`;

    // Validate the resolved target directory path is a subdirectory of the session folder path
    if (!resolvedTargetDirPath.startsWith(safeSessionPath)) {
      throw new Error("Invalid path: Directory traversal detected");
    }
    await fs.promises.rm(resolvedTargetDirPath, {
      recursive: true,
      force: true,
    });
  } catch (error: any) {
    console.log("Folder deletion error", error);
    throw error;
  }
};

// Function to reload client session without removing browser cache
const reloadSession = async (sessionId: string) => {
  try {
    const client = sessions.get(sessionId);
    if (!client) {
      return;
    }
    client.pupPage?.removeAllListeners("close");
    client.pupPage?.removeAllListeners("error");
    try {
      const pages = await client.pupBrowser?.pages();
      if (pages) {
        await Promise.all(pages.map((page) => page.close()));
        await Promise.race([
          client.pupBrowser?.close(),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]);
      }
    } catch (e) {
      const childProcess = client.pupBrowser?.process();
      if (childProcess) {
        childProcess.kill(9);
      }
    }
    sessions.delete(sessionId);
    setupSession(sessionId);
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};

const deleteSession = async (
  sessionId: string,
  validation: SessionValidation
) => {
  try {
    const client = sessions.get(sessionId);
    if (!client) {
      return;
    }
    client.pupPage?.removeAllListeners("close");
    client.pupPage?.removeAllListeners("error");
    if (validation.success) {
      // Client Connected, request logout
      console.log(`Logging out session ${sessionId}`);
      await client.logout();
    } else if (validation.message === "session_not_connected") {
      // Client not Connected, request destroy
      console.log(`Destroying session ${sessionId}`);
      await client.destroy();
    }
    // Wait 10 secs for client.pupBrowser to be disconnected before deleting the folder
    let maxDelay = 0;
    while (client.pupBrowser?.isConnected() && maxDelay < 10) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      maxDelay++;
    }
    await deleteSessionFolder(sessionId);
    sessions.delete(sessionId);
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};

// Function to handle session flush
const flushSessions = async (deleteOnlyInactive: boolean) => {
  try {
    // Read the contents of the sessions folder
    const files = await fs.promises.readdir(sessionFolderPath);
    // Iterate through the files in the parent folder
    for (const file of files) {
      // Use regular expression to extract the string from the folder name
      const match = file.match(/^session-(.+)$/);
      if (match) {
        const sessionId = match[1];
        const validation = await validateSession(sessionId);
        if (!deleteOnlyInactive || !validation.success) {
          await deleteSession(sessionId, validation);
        }
      }
    }
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};

export {
  sessions,
  setupSession,
  restoreSessions,
  validateSession,
  deleteSession,
  reloadSession,
  flushSessions,
};
