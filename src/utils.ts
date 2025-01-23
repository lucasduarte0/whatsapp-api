import axios from "axios";
import config from "./config";
import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

const { globalApiKey, disabledCallbacks } = config;

/**
 * Trigger webhook endpoint
 *
 * @param webhookURL The URL of the webhook to trigger
 * @param sessionId The ID of the session
 * @param dataType The type of data being sent
 * @param data The data being sent
 */
export const triggerWebhook = (
  webhookURL: string,
  sessionId: string,
  dataType: string,
  data?: any
) => {
  axios
    .post(
      webhookURL,
      { dataType, data, sessionId },
      { headers: { "x-api-key": globalApiKey } }
    )
    .catch((error: Error) =>
      console.error(
        "Failed to send new message webhook:",
        sessionId,
        dataType,
        error.message,
        data || ""
      )
    );
};

export const sendErrorResponse = (
  c: Context,
  status: number,
  message: string
) => {
  c.status(status as StatusCode);
  return c.json({ success: false, error: message });
};

/**
 * Function to wait for a specific item not to be null
 *
 * @param rootObj The root object to wait on
 * @param nestedPath The path to the nested object
 * @param maxWaitTime The maximum time to wait (in milliseconds)
 * @param interval The interval between checks (in milliseconds)
 * @returns A promise that resolves when the nested object is no longer null
 */
export const waitForNestedObject = (
  rootObj: any,
  nestedPath: string,
  maxWaitTime: number = 10000,
  interval: number = 100
) => {
  console.log("Waiting for nested object:", nestedPath);
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    const checkObject = () => {
      const nestedObj = nestedPath
        .split(".")
        .reduce((obj, key) => (obj ? obj[key] : undefined), rootObj);
      if (nestedObj) {
        // Nested object exists, resolve the promise
        resolve();
      } else if (Date.now() - start > maxWaitTime) {
        // Maximum wait time exceeded, reject the promise
        console.log("Timed out waiting for nested object");
        reject(new Error("Timeout waiting for nested object"));
      } else {
        // Nested object not yet created, continue waiting
        setTimeout(checkObject, interval);
      }
    };
    checkObject();
  });
};

/**
 * Check if an event is enabled
 *
 * @param event The event to check
 * @returns A promise that resolves if the event is enabled, rejects if it is disabled
 */
export const checkIfEventisEnabled = (event: any) => {
  return new Promise<void>((resolve) => {
    if (!disabledCallbacks.includes(event)) {
      resolve();
    }
  });
};
