import { Hono } from "hono";
import { some } from "hono/combine";
import middleware from "../middleware";
import { sessions } from "../sessions";
import { sendErrorResponse } from "../utils";

const contactRouter = new Hono();
contactRouter.use(middleware.apikey);

contactRouter.post(
  "/getClassInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const contact = await client.getContactById(contactId);
      if (!contact) {
        return sendErrorResponse(c, 404, "Contact not Found");
      }
      return c.json({ success: true, result: contact });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
contactRouter.post(
  "/block/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const contact = await client.getContactById(contactId);
      if (!contact) {
        return sendErrorResponse(c, 404, "Contact not Found");
      }
      const result = await contact.block();
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
contactRouter.post(
  "/getAbout/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const contact = await client.getContactById(contactId);
      if (!contact) {
        return sendErrorResponse(c, 404, "Contact not Found");
      }
      const result = await contact.getAbout();
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
contactRouter.post(
  "/getChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const contact = await client.getContactById(contactId);
      if (!contact) {
        return sendErrorResponse(c, 404, "Contact not Found");
      }
      const result = await contact.getChat();
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
contactRouter.post(
  "/unblock/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const contact = await client.getContactById(contactId);
      if (!contact) {
        return sendErrorResponse(c, 404, "Contact not Found");
      }
      const result = await contact.unblock();
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
contactRouter.post(
  "/getFormattedNumber/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const contact = await client.getContactById(contactId);
      if (!contact) {
        return sendErrorResponse(c, 404, "Contact not Found");
      }
      const result = await contact.getFormattedNumber();
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
contactRouter.post(
  "/getCountryCode/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const contact = await client.getContactById(contactId);
      if (!contact) {
        return sendErrorResponse(c, 404, "Contact not Found");
      }
      const result = await contact.getCountryCode();
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);
contactRouter.post(
  "/getProfilePicUrl/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  async (c) => {
    try {
      const { contactId } = await c.req.json();
      const client = sessions.get(c.req.param("sessionId"))!;
      const contact = await client.getContactById(contactId);
      if (!contact) {
        return sendErrorResponse(c, 404, "Contact not Found");
      }
      const result = (await contact.getProfilePicUrl()) || null;
      return c.json({ success: true, result });
    } catch (error: any) {
      return sendErrorResponse(c, 500, error.message);
    }
  }
);

export default contactRouter;
