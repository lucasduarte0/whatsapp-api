// src/app.ts
import routes from "./routes";
import config from "./config";
import { restoreSessions } from "./sessions";
import { bodyLimit } from "hono/body-limit";
import { Hono } from "hono";

const { maxAttachmentSize } = config;

// Initialize Express app
const app = new Hono();
// Add bodyLimit middleware to limit the size of the request body
app.use(
  bodyLimit({
    maxSize: maxAttachmentSize * 1024 * 1024, // 50kb
    onError: (c) => {
      return c.text("overflow :(", 413);
    },
  })
);
// Use routes middleware
app.route("/", routes);

app.notFound((c) => {
  return c.text("Custom 404 Message", 404);
});

restoreSessions();

export default app;
