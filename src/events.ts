import { MessageTypes } from "whatsapp-web.js";
import config from "./config";
import { ClientWithQR, sessions, setupSession } from "./sessions";
import {
  waitForNestedObject,
  checkIfEventisEnabled,
  triggerWebhook,
} from "./utils";
import {
  handleSaveMediaMessage,
  handleSaveTextMessage,
} from "./services/messageService";

const { baseWebhookURL, setMessagesAsSeen, recoverSessions } = config;

export const initializeEvents = (client: ClientWithQR, sessionId: string) => {
  // check if the session webhook is overridden
  const sessionWebhook =
    process.env[sessionId.toUpperCase() + "_WEBHOOK_URL"] || baseWebhookURL;

  if (recoverSessions) {
    waitForNestedObject(client, "pupPage")
      .then(() => {
        const restartSession = async (sessionId: string) => {
          sessions.delete(sessionId);
          await client.destroy().catch(() => {});
          setupSession(sessionId);
        };
        client.pupPage?.once("close", function () {
          // emitted when the page closes
          console.log(
            `[SERVER] Browser page closed for ${sessionId}. Restoring`
          );
          restartSession(sessionId);
        });
        client.pupPage?.once("error", function () {
          // emitted when the page crashes
          console.log(
            `[SERVER] Error occurred on browser page for ${sessionId}. Restoring`
          );
          restartSession(sessionId);
        });
      })
      .catch(() => {});
  }

  checkIfEventisEnabled("auth_failure").then(() => {
    client.on("auth_failure", (msg) => {
      triggerWebhook(sessionWebhook, sessionId, "status", { msg });
    });
  });

  checkIfEventisEnabled("authenticated").then(() => {
    client.on("authenticated", () => {
      console.log(`[SESSION] ${sessionId}: Authenticated`);
      triggerWebhook(sessionWebhook, sessionId, "authenticated");
    });
  });

  checkIfEventisEnabled("call").then(() => {
    client.on("call", async (call) => {
      triggerWebhook(sessionWebhook, sessionId, "call", { call });
    });
  });

  checkIfEventisEnabled("change_state").then(() => {
    client.on("change_state", (state) => {
      triggerWebhook(sessionWebhook, sessionId, "change_state", { state });
    });
  });

  checkIfEventisEnabled("disconnected").then(() => {
    client.on("disconnected", (reason) => {
      triggerWebhook(sessionWebhook, sessionId, "disconnected", { reason });
    });
  });

  checkIfEventisEnabled("group_join").then(() => {
    client.on("group_join", (notification) => {
      triggerWebhook(sessionWebhook, sessionId, "group_join", { notification });
    });
  });

  checkIfEventisEnabled("group_leave").then(() => {
    client.on("group_leave", (notification) => {
      triggerWebhook(sessionWebhook, sessionId, "group_leave", {
        notification,
      });
    });
  });

  checkIfEventisEnabled("group_update").then(() => {
    client.on("group_update", (notification) => {
      triggerWebhook(sessionWebhook, sessionId, "group_update", {
        notification,
      });
    });
  });

  checkIfEventisEnabled("loading_screen").then(() => {
    client.on("loading_screen", (percent, message) => {
      triggerWebhook(sessionWebhook, sessionId, "loading_screen", {
        percent,
        message,
      });
    });
  });

  checkIfEventisEnabled("media_uploaded").then(() => {
    client.on("media_uploaded", (message) => {
      triggerWebhook(sessionWebhook, sessionId, "media_uploaded", { message });
    });
  });

  checkIfEventisEnabled("message").then(() => {
    client.on("message", async (message) => {
      console.log(
        `[SESSION] ${sessionId}: Message received from ${
          (await message.getContact()).name ?? message.from
        }`
      );

      triggerWebhook(sessionWebhook, sessionId, "message", { message });

      if (message.type === MessageTypes.TEXT) {
        await handleSaveTextMessage(sessionId, message);
      }

      if (message.hasMedia) {
        // custom service event
        checkIfEventisEnabled("media").then(async () => {
          try {
            const messageMedia = await message.downloadMedia();
            await handleSaveMediaMessage(sessionId, message, messageMedia);

            triggerWebhook(sessionWebhook, sessionId, "media", {
              messageMedia,
              message,
            });
          } catch (error) {
            console.error("Error downloading media:", error);
          }
        });
      }
      if (setMessagesAsSeen) {
        const chat = await message.getChat();
        chat.sendSeen();
      }
    });
  });

  checkIfEventisEnabled("message_ack").then(() => {
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

  checkIfEventisEnabled("message_create").then(() => {
    client.on("message_create", async (message) => {
      console.log(
        `[SESSION] ${sessionId}: Message created from ${
          (await message.getContact()).name ?? message.from
        }`
      );
      triggerWebhook(sessionWebhook, sessionId, "message_create", { message });

      if (message.type === MessageTypes.TEXT) {
        await handleSaveTextMessage(sessionId, message);
      }

      if (setMessagesAsSeen) {
        const chat = await message.getChat();
        chat.sendSeen();
      }
    });
  });

  checkIfEventisEnabled("message_reaction").then(() => {
    client.on("message_reaction", (reaction) => {
      triggerWebhook(sessionWebhook, sessionId, "message_reaction", {
        reaction,
      });
    });
  });

  checkIfEventisEnabled("message_edit").then(() => {
    client.on("message_edit", (message, newBody, prevBody) => {
      triggerWebhook(sessionWebhook, sessionId, "message_edit", {
        message,
        newBody,
        prevBody,
      });
    });
  });

  checkIfEventisEnabled("message_ciphertext").then(() => {
    client.on("message_ciphertext", (message) => {
      triggerWebhook(sessionWebhook, sessionId, "message_ciphertext", {
        message,
      });
    });
  });

  checkIfEventisEnabled("message_revoke_everyone").then(() => {
    client.on("message_revoke_everyone", async (message) => {
      triggerWebhook(sessionWebhook, sessionId, "message_revoke_everyone", {
        message,
      });
    });
  });

  checkIfEventisEnabled("message_revoke_me").then(() => {
    client.on("message_revoke_me", async (message) => {
      triggerWebhook(sessionWebhook, sessionId, "message_revoke_me", {
        message,
      });
    });
  });

  client.on("qr", (qr) => {
    // inject qr code into session
    client.qr = qr;
    checkIfEventisEnabled("qr").then(() => {
      triggerWebhook(sessionWebhook, sessionId, "qr", { qr });
    });
  });

  checkIfEventisEnabled("ready").then(() => {
    client.on("ready", () => {
      console.log(`[SESSION] ${sessionId}: Ready`);
      triggerWebhook(sessionWebhook, sessionId, "ready");

      // Run save last messages
      
    });
  });

  checkIfEventisEnabled("contact_changed").then(() => {
    client.on("contact_changed", async (message, oldId, newId, isContact) => {
      triggerWebhook(sessionWebhook, sessionId, "contact_changed", {
        message,
        oldId,
        newId,
        isContact,
      });
    });
  });

  checkIfEventisEnabled("chat_removed").then(() => {
    client.on("chat_removed", async (chat) => {
      triggerWebhook(sessionWebhook, sessionId, "chat_removed", { chat });
    });
  });

  checkIfEventisEnabled("chat_archived").then(() => {
    client.on("chat_archived", async (chat, currState, prevState) => {
      triggerWebhook(sessionWebhook, sessionId, "chat_archived", {
        chat,
        currState,
        prevState,
      });
    });
  });

  checkIfEventisEnabled("unread_count").then(() => {
    client.on("unread_count", async (chat) => {
      triggerWebhook(sessionWebhook, sessionId, "unread_count", { chat });
    });
  });
};
