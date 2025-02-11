import swaggerAutogen from "swagger-autogen";

const outputFile: string = "./src/static/swagger.json";
const routes: string[] = ["./src/routes.ts"];

const doc: any = {
  info: {
    title: "WhatsApp API",
    description: "API Wrapper for WhatsAppWebJS",
  },
  servers: [
    {
      url: "",
      description: "",
    },
    {
      url: "http://localhost:3000",
      description: "localhost",
    },
  ],
  securityDefinitions: {
    apiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "x-api-key",
    },
  },
  produces: ["application/json"],
  tags: [
    {
      name: "Session",
      description: "Handling multiple sessions logic, creation and deletion",
    },
    {
      name: "Client",
      description: "All functions related to the client",
    },
    {
      name: "Message",
      description:
        "May fail if the message is too old (Only from the last 100 Messages of the given chat)",
    },
  ],
  definitions: {
    StartSessionResponse: {
      success: true,
      message: "Session initiated successfully",
    },
    StatusSessionResponse: {
      success: true,
      state: "CONNECTED",
      message: "session_connected",
    },
    RestartSessionResponse: {
      success: true,
      message: "Restarted successfully",
    },
    TerminateSessionResponse: {
      success: true,
      message: "Logged out successfully",
    },
    TerminateSessionsResponse: {
      success: true,
      message: "Flush completed successfully",
    },
    ErrorResponse: {
      success: false,
      error: "Some server error",
    },
    NotFoundResponse: {
      success: false,
      error: "Some server error",
    },
    ForbiddenResponse: {
      success: false,
      error: "Invalid API key",
    },
  },
};

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc);
