import * as qrcode from "qrcode-terminal";
import config from "../config";
import { sendErrorResponse } from "../utils";
import { type Context } from "hono"; // Import Hono's Context type

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
    Bun.write(
      `${sessionFolderPath}/message_log.txt`,
      `${JSON.stringify(await c.req.json())}\r\n`
    );
    return c.json({ success: true });
  } catch (error: any) {
    console.log(error);
    Bun.write(
      `${sessionFolderPath}/message_log.txt`,
      `(ERROR) ${JSON.stringify(error)}\r\n`
    );
    return sendErrorResponse(c, 500, error.message);
  }
};

export { ping, localCallbackExample };
