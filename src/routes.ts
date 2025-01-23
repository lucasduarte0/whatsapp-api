import { Hono } from "hono";
import { some } from "hono/combine";
import { swaggerUI } from "@hono/swagger-ui";
import { serveStatic } from "hono/bun";
// import swaggerDocument from '../swagger.json';
import config from "./config";

import middleware from "./middleware";
import * as healthController from "./controllers/healthController";
import * as sessionController from "./controllers/sessionController";
import * as clientController from "./controllers/clientController";
import * as chatController from "./controllers/chatController";
import * as groupChatController from "./controllers/groupChatController";
import * as messageController from "./controllers/messageController";
import * as contactController from "./controllers/contactController";
import adminRoutes from "./routes/admin";

const { enableLocalCallbackExample, enableSwaggerEndpoint } = config;

const routes = new Hono();

/**
 * ================
 * HEALTH ENDPOINTS
 * ================
 */
// API endpoint to check if server is alive
routes.get("/ping", healthController.ping);
// API basic callback
if (enableLocalCallbackExample) {
  routes.post(
    "/localCallbackExample",
    middleware.apikey,
    healthController.localCallbackExample
  );
}

/**
 * ================
 * SESSION ENDPOINTS
 * ================
 */
const sessionRouter = new Hono();
sessionRouter.use(middleware.apikey);
sessionRouter.use(middleware.sessionSwagger);

sessionRouter.get(
  "/start/:sessionId",
  middleware.sessionNameValidation,
  sessionController.startSession
);
sessionRouter.get(
  "/status/:sessionId",
  middleware.sessionNameValidation,
  sessionController.statusSession
);
sessionRouter.get(
  "/qr/:sessionId",
  middleware.sessionNameValidation,
  sessionController.sessionQrCode
);
// sessionRouter.get(
//   "/qr/:sessionId/image",
//   middleware.sessionNameValidation,
//   sessionController.sessionQrCodeImage
// );
sessionRouter.get(
  "/restart/:sessionId",
  middleware.sessionNameValidation,
  sessionController.restartSession
);
sessionRouter.get(
  "/terminate/:sessionId",
  middleware.sessionNameValidation,
  sessionController.terminateSession
);
sessionRouter.get(
  "/terminateInactive",
  sessionController.terminateInactiveSessions
);
sessionRouter.get("/terminateAll", sessionController.terminateAllSessions);

routes.route("/session", sessionRouter);

/**
 * ================
 * ADMIN UI ENDPOINTS
 * ================
 */
routes.route("/admin", adminRoutes);

/**
 * ================
 * CLIENT ENDPOINTS
 * ================
 */

const clientRouter = new Hono();
clientRouter.use(middleware.apikey);
sessionRouter.use(middleware.clientSwagger);

clientRouter.get(
  "/getClassInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getClassInfo
);
clientRouter.post(
  "/acceptInvite/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.acceptInvite
);
clientRouter.post(
  "/archiveChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.archiveChat
);
clientRouter.post(
  "/createGroup/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.createGroup
);
clientRouter.post(
  "/getBlockedContacts/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getBlockedContacts
);
clientRouter.post(
  "/getChatById/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getChatById
);
clientRouter.post(
  "/getChatLabels/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getChatLabels
);
clientRouter.get(
  "/getChats/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getChats
);
clientRouter.post(
  "/getChatsByLabelId/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getChatsByLabelId
);
clientRouter.post(
  "/getCommonGroups/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getCommonGroups
);
clientRouter.post(
  "/getContactById/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getContactById
);
clientRouter.get(
  "/getContacts/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getContacts
);
clientRouter.post(
  "/getInviteInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getInviteInfo
);
clientRouter.post(
  "/getLabelById/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getLabelById
);
clientRouter.post(
  "/getLabels/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getLabels
);
clientRouter.post(
  "/addOrRemoveLabels/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.addOrRemoveLabels
);
clientRouter.post(
  "/getNumberId/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getNumberId
);
clientRouter.post(
  "/isRegisteredUser/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.isRegisteredUser
);
clientRouter.post(
  "/getProfilePicUrl/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getProfilePictureUrl
);
clientRouter.get(
  "/getState/:sessionId",
  middleware.sessionNameValidation,
  clientController.getState
);
clientRouter.post(
  "/markChatUnread/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.markChatUnread
);
clientRouter.post(
  "/muteChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.muteChat
);
clientRouter.post(
  "/pinChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.pinChat
);
clientRouter.post(
  "/searchMessages/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.searchMessages
);
clientRouter.post(
  "/sendMessage/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.sendMessage
);
clientRouter.post(
  "/sendPresenceAvailable/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.sendPresenceAvailable
);
clientRouter.post(
  "/sendPresenceUnavailable/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.sendPresenceUnavailable
);
clientRouter.post(
  "/sendSeen/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.sendSeen
);
clientRouter.post(
  "/setDisplayName/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.setDisplayName
);
clientRouter.post(
  "/setProfilePicture/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.setProfilePicture
);
clientRouter.post(
  "/setStatus/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.setStatus
);
clientRouter.post(
  "/unarchiveChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.unarchiveChat
);
clientRouter.post(
  "/unmuteChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.unmuteChat
);
clientRouter.post(
  "/unpinChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.unpinChat
);
clientRouter.get(
  "/getWWebVersion/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  clientController.getWWebVersion
);

routes.route("/client", clientRouter);

/**
 * ================
 * CHAT ENDPOINTS
 * ================
 */
const chatRouter = new Hono();
chatRouter.use(middleware.apikey);
sessionRouter.use(middleware.chatSwagger);

chatRouter.post(
  "/getClassInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  chatController.getClassInfo
);
chatRouter.post(
  "/clearMessages/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  chatController.clearMessages
);
chatRouter.post(
  "/clearState/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  chatController.clearState
);
chatRouter.post(
  "/delete/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  chatController.deleteChat
);
chatRouter.post(
  "/fetchMessages/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  chatController.fetchMessages
);
chatRouter.post(
  "/getContact/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  chatController.getContact
);
chatRouter.post(
  "/sendStateRecording/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  chatController.sendStateRecording
);
chatRouter.post(
  "/sendStateTyping/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  chatController.sendStateTyping
);

routes.route("/chat", chatRouter);

/**
 * ================
 * GROUP CHAT ENDPOINTS
 * ================
 */
const groupChatRouter = new Hono();
groupChatRouter.use(middleware.apikey);
sessionRouter.use(middleware.groupChatSwagger);

groupChatRouter.post(
  "/getClassInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.getClassInfo
);
groupChatRouter.post(
  "/addParticipants/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.addParticipants
);
groupChatRouter.post(
  "/demoteParticipants/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.demoteParticipants
);
groupChatRouter.post(
  "/getInviteCode/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.getInviteCode
);
groupChatRouter.post(
  "/leave/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.leave
);
groupChatRouter.post(
  "/promoteParticipants/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.promoteParticipants
);
groupChatRouter.post(
  "/removeParticipants/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.removeParticipants
);
groupChatRouter.post(
  "/revokeInvite/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.revokeInvite
);
groupChatRouter.post(
  "/setDescription/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.setDescription
);
groupChatRouter.post(
  "/setInfoAdminsOnly/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.setInfoAdminsOnly
);
groupChatRouter.post(
  "/setMessagesAdminsOnly/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.setMessagesAdminsOnly
);
groupChatRouter.post(
  "/setSubject/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.setSubject
);
groupChatRouter.post(
  "/setPicture/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.setPicture
);
groupChatRouter.post(
  "/deletePicture/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  groupChatController.deletePicture
);

routes.route("/groupChat", groupChatRouter);

/**
 * ================
 * MESSAGE ENDPOINTS
 * ================
 */
const messageRouter = new Hono();
messageRouter.use(middleware.apikey);
sessionRouter.use(middleware.messageSwagger);

messageRouter.post(
  "/getClassInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.getClassInfo
);
messageRouter.post(
  "/delete/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.deleteMessage
);
messageRouter.post(
  "/downloadMedia/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.downloadMedia
);
messageRouter.post(
  "/forward/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.forward
);
messageRouter.post(
  "/getInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.getInfo
);
messageRouter.post(
  "/getMentions/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.getMentions
);
messageRouter.post(
  "/getOrder/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.getOrder
);
messageRouter.post(
  "/getPayment/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.getPayment
);
messageRouter.post(
  "/getQuotedMessage/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.getQuotedMessage
);
messageRouter.post(
  "/react/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.react
);
messageRouter.post(
  "/reply/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.reply
);
messageRouter.post(
  "/star/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.star
);
messageRouter.post(
  "/unstar/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  messageController.unstar
);

routes.route("/message", messageRouter);

/**
 * ================
 * CONTACT ENDPOINTS
 * ================
 */
const contactRouter = new Hono();
contactRouter.use(middleware.apikey);
sessionRouter.use(middleware.contactSwagger);

contactRouter.post(
  "/getClassInfo/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  contactController.getClassInfo
);
contactRouter.post(
  "/block/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  contactController.block
);
contactRouter.post(
  "/getAbout/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  contactController.getAbout
);
contactRouter.post(
  "/getChat/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  contactController.getChat
);
contactRouter.post(
  "/unblock/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  contactController.unblock
);
contactRouter.post(
  "/getFormattedNumber/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  contactController.getFormattedNumber
);
contactRouter.post(
  "/getCountryCode/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  contactController.getCountryCode
);
contactRouter.post(
  "/getProfilePicUrl/:sessionId",
  some(middleware.sessionNameValidation, middleware.sessionValidation),
  contactController.getProfilePicUrl
);

routes.route("/contact", contactRouter);

/**
 * ================
 * SWAGGER ENDPOINTS
 * ================
 */
if (enableSwaggerEndpoint) {
  routes.get("/docs", serveStatic({ path: "./src/static/swagger.json" }));
  routes.get("/ui", swaggerUI({ url: "/doc" }));
}

export default routes;
