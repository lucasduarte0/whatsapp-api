// External modules
import * as fs from "fs";
import * as path from "path";
import {
  Client,
  type ClientOptions,
  LocalAuth,
  WAState,
} from "whatsapp-web.js";

// Internal modules
import config from "./config";
import { waitForNestedObject } from "./utils";
import { initializeEvents } from "./events";

// Custom types
export interface ClientWithQR extends Client {
  qr?: string;
}

// Configuration constants
const {
  sessionFolderPath,
  // maxAttachmentSize,
  webVersion,
  webVersionCacheType,
} = config;

// Sessions Map
const sessions: Map<string, ClientWithQR> = new Map();

// Session Validation Types
type SessionValidation = {
  success: boolean;
  state: WAState | null;
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

    const client = sessions.get(sessionId) as Client;
    // wait until the client is created
    await waitForNestedObject(client, "pupPage").catch((error: any) => {
      return { success: false, state: null, message: error.message };
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
          console.log(`[SESSION] ${sessionId}: Existing session detected`);
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

    const clientOptions: ClientOptions = {
      puppeteer: {
        executablePath: process.env["CHROME_BIN"] || undefined,
        headless: process.env.NODE_ENV === "production" ? true : false,
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
      switch (webVersionCacheType?.toLowerCase()) {
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
    } catch {
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
      console.log(`[]Logging out`);
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
