import * as qrcode from "qrcode-terminal";
import config from "../config";
import { sendErrorResponse } from "../utils";
import { type Context } from "hono"; // Import Hono's Context type
import { promises as fsPromises } from "fs";

const { sessionFolderPath } = config;

/**
 * Responds to ping request with 'pong'
 *
 * @function ping
 * @async
 * @param  req - Express request object
 * @param  res - Express response object
 * @returns  - Promise that resolves once response is sent
 * @throws  - Throws error if response fails
 */
const ping = async (c: Context) => {
  /*
    #swagger.tags = ['Various']
  */
  try {
    return c.json({ success: true, message: "pong" }, 200);
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
};

/**
 * Example local callback function that generates a QR code and writes a log file
 *
 * @function localCallbackExample
 * @async
 * @param  req - Express request object containing a body object with dataType and data
 * @param  c.req.body.dataType - Type of data (in this case, 'qr')
 * @param  c.req.body.data - Data to generate a QR code from
 * @param  res - Express response object
 * @returns  - Promise that resolves once response is sent
 * @throws  - Throws error if response fails
 */
const localCallbackExample = async (c: Context) => {
  /*
    #swagger.tags = ['Various']
  */
  try {
    const { dataType, data } = await c.req.json();

    if (dataType === "qr") {
      qrcode.generate(data.qr, { small: true });
    }

    // Read the existing log file
    const logFilePath = `${sessionFolderPath}/message_log.jsonc`;
    let existingData = [];

    try {
      const fileContent = await fsPromises.readFile(logFilePath, "utf8");
      const strippedContent = stripJsonComments(fileContent);
      existingData = JSON.parse(strippedContent);
    } catch (readError: any) {
      console.error("Error reading log file:", readError.message);
      console.error("Stack trace:", readError.stack);
    }

    // Append new entry
    existingData.push(await c.req.json());

    // Write updated data back to the log file
    const jsonString = JSON.stringify(existingData, null, 2) + "\r\n";
    Bun.write(logFilePath, jsonString);

    return c.json({ success: true });
  } catch (error: any) {
    console.log(error);
    return sendErrorResponse(c, 500, error.message);
  }
};

// Helper function to strip comments from JSONC
function stripJsonComments(data: string): string {
  return data.replace(/\/\/.*|\/\*[^]*?\*\//g, "").trim();
}

export { ping, localCallbackExample };
