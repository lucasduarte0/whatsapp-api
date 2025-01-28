import { Hono } from "hono";
// import { swaggerUI } from "@hono/swagger-ui";
// import { serveStatic } from "hono/bun";
// import swaggerDocument from '../swagger.json';
import { openAPISpecs } from "hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";

import adminRoutes from "./app/admin";
import sessionRouter from "./routes/session.route";
import clientRouter from "./routes/client.route";
import healthRouter from "./routes/health.route";
import chatRouter from "./routes/chat.route";
import contactRouter from "./routes/contact.route";
import groupChatRouter from "./routes/groupChat.route";
import messageRouter from "./routes/message.route";

const routes = new Hono();

routes.route("/ping", healthRouter);
routes.route("/session", sessionRouter);
routes.route("/admin", adminRoutes);
routes.route("/client", clientRouter);
routes.route("/chat", chatRouter);
routes.route("/groupChat", groupChatRouter);
routes.route("/message", messageRouter);
routes.route("/contact", contactRouter);

/**
 * ================
 * SWAGGER ENDPOINTS
 * ================
 */
// if (enableSwaggerEndpoint) {
//   routes.get("/docs", serveStatic({ path: "./src/static/swagger.json" }));
//   routes.get("/ui", swaggerUI({ url: "/docs" }));
// }

routes.get(
  "/openapi",
  openAPISpecs(routes, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
      servers: [{ url: "http://localhost:3000", description: "Local Server" }],
    },
  })
);

routes.get(
  "/docs",
  apiReference({
    theme: "saturn",
    spec: { url: "/openapi" },
  })
);

export default routes;
