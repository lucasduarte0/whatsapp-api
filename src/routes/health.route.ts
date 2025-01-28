import * as qrcode from "qrcode-terminal";
import config from "../config";
import { sendErrorResponse } from "../utils";
import { Hono } from "hono"; // Import Hono's Context type
import { promises as fsPromises } from "fs";
import middleware from "../middleware";

const { enableLocalCallbackExample, sessionFolderPath } = config;

const healthRouter = new Hono();

healthRouter.get("/ping", async (c) => {
  /*
    #swagger.tags = ['Various']
  */
  try {
    return c.json({ success: true, message: "pong" }, 200);
  } catch (error: any) {
    return sendErrorResponse(c, 500, error.message);
  }
});
// API basic callback
if (enableLocalCallbackExample) {
  healthRouter.post("/localCallbackExample", middleware.apikey, async (c) => {
    try {
      const { dataType, data } = await c.req.json();

      if (dataType === "qr") {
        qrcode.generate(data.qr, { small: true });
      }

      // Define the log file path
      const logFilePath = `${sessionFolderPath}/message_log.jsonc`;
      let existingData = [];

      try {
        const fileContent = await fsPromises.readFile(logFilePath, "utf8");
        const strippedContent = stripJsonComments(fileContent);

        // Attempt to parse the JSON
        try {
          existingData = JSON.parse(strippedContent);
        } catch (parseError: any) {
          console.error("Error parsing JSON data:", parseError?.message);
          console.error("File content was:", strippedContent); // Debug the content
          throw new Error("Failed to parse log file JSON."); // Throw or handle parsing error
        }
      } catch (readError: any) {
        console.error("Error reading log file:", readError.message);
        console.error("Stack trace:", readError.stack);
      }

      // Append new entry
      existingData.push({ dataType, data }); // Avoid reading request body again

      // Write updated data back to the log file
      const jsonString = JSON.stringify(existingData, null, 2) + "\r\n";
      await fsPromises.writeFile(logFilePath, jsonString);

      return c.json({ success: true });
    } catch (error: any) {
      console.error("Error processing request:", error.message);
      return sendErrorResponse(c, 500, error.message);
    }
  });
}

// Helper function to strip comments from JSONC
function stripJsonComments(data: string): string {
  return data.replace(/\/\/.*|\/\*[^]*?\*\//g, "").trim();
}

export default healthRouter;
