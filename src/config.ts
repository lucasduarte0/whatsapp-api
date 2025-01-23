// src/config.ts (1-65)
import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

interface Config {
  sessionFolderPath: string;
  enableLocalCallbackExample: boolean;
  globalApiKey?: string;
  baseWebhookURL: string;
  maxAttachmentSize: number;
  setMessagesAsSeen: boolean;
  disabledCallbacks: string[];
  enableSwaggerEndpoint: boolean;
  webVersion?: string;
  webVersionCacheType?: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  recoverSessions: boolean;
}

const config: Config = {
  sessionFolderPath: process.env["SESSIONS_PATH"] || "./sessions",
  enableLocalCallbackExample:
    process.env["ENABLE_LOCAL_CALLBACK_EXAMPLE"]?.toLowerCase() === "true",
  globalApiKey: process.env["API_KEY"],
  baseWebhookURL: process.env["BASE_WEBHOOK_URL"] as string,
  maxAttachmentSize: process.env["MAX_ATTACHMENT_SIZE"]
    ? parseInt(process.env["MAX_ATTACHMENT_SIZE"])
    : 10000000,
  setMessagesAsSeen: process.env["SET_MESSAGES_AS_SEEN"]?.toLowerCase() === "true",
  disabledCallbacks: process.env["DISABLED_CALLBACKS"]
    ? process.env["DISABLED_CALLBACKS"].split("|")
    : [],
  enableSwaggerEndpoint: process.env["ENABLE_SWAGGER_ENDPOINT"]?.toLowerCase() === "true",
  webVersion: process.env["WEB_VERSION"],
  webVersionCacheType: process.env["WEB_VERSION_CACHE_TYPE"] || undefined,
  rateLimitMax: process.env["RATE_LIMIT_MAX"]
    ? parseInt(process.env["RATE_LIMIT_MAX"])
    : 1000,
  rateLimitWindowMs: process.env["RATE_LIMIT_WINDOW_MS"]
    ? parseInt(process.env["RATE_LIMIT_WINDOW_MS"])
    : 1000,
  recoverSessions: process.env["RECOVER_SESSIONS"] === "true",
};

// Check if BASE_WEBHOOK_URL environment variable is available
if (!config.baseWebhookURL) {
  console.error(
    "BASE_WEBHOOK_URL environment variable is not available. Exiting..."
  );
  process.exit(1); // Terminate the application with an error code
}

export default config;
