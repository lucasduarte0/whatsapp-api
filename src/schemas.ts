import { resolver, validator as zv } from "hono-openapi/zod";
import { MessageMedia, Poll } from "whatsapp-web.js";
import { z } from "zod";

export const SessionIdSchema = z.object({
  sessionId: z.string().min(3),
});

// Reusable describeRoute errors
export const errorResponses = {
  422: {
    description: "Unprocessable Entity",
    content: {
      "application/json": {
        schema: resolver(
          z.object({ success: z.boolean(), message: z.string() })
        ),
      },
    },
  },
  500: {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: resolver(
          z.object({ success: z.boolean(), message: z.string() })
        ),
      },
    },
  },
};

// Schema for string content
const StringContentSchema = z.object({
  content: z.string(),
  contentType: z.literal("string"),
});

// Schema for MessageMedia content
const MessageMediaContentSchema = z.object({
  content: z.instanceof(MessageMedia),
  contentType: z.literal("MessageMedia"),
});

// Schema for MessageMediaFromURL content
const MessageMediaFromURLContentSchema = z.object({
  content: z.string(), // Assuming it's a URL string
  contentType: z.literal("MessageMediaFromURL"),
});

// Schema for Location content
const LocationContentSchema = z.object({
  content: z.object({
    latitude: z.number(),
    longitude: z.number(),
    description: z.string().optional(),
  }).optional(),
  contentType: z.literal("Location"),
});

// Schema for Buttons content
const ButtonsContentSchema = z.object({
  content: z.object({
    body: z.string(),
    buttons: z.array(z.any()),
    title: z.string(),
    footer: z.string(),
  }).optional(),
  contentType: z.literal("Buttons"),
});

// Schema for List content
const ListContentSchema = z.object({
  content: z.object({
    body: z.string(),
    buttonText: z.string(),
    sections: z.array(z.any()),
    title: z.string(),
    footer: z.string(),
  }).optional(),
  contentType: z.literal("List"),
});

// Schema for Contact content
const ContactContentSchema = z.object({
  content: z.object({
    contactId: z.string(),
  }).optional(),
  contentType: z.literal("Contact"),
});

// Schema for Poll content
const PollContentSchema = z.object({
  content: z.instanceof(Poll),
  contentType: z.literal("Poll"),
});

export const ContentSchema = z.discriminatedUnion("contentType", [
  StringContentSchema,
  MessageMediaContentSchema,
  MessageMediaFromURLContentSchema,
  LocationContentSchema,
  ButtonsContentSchema,
  ListContentSchema,
  ContactContentSchema,
  PollContentSchema,
]);
