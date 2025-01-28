import { Hono } from "hono";
// import Layout from "./components/Layout";
// import SessionManager from "./components/SessionManager";

const admin = new Hono();

// // Admin UI route
// admin.get("/:sessionId", async (c) => {
//   const sessionId = c.req.param("sessionId");
//   const qrResponse = await sessionQrCode(c);
//   const qrData = await qrResponse.json();

//   return c.html(
//     <Layout>
//       <SessionManager
//         sessionId={sessionId}
//         qrCode={qrData.success ? qrData.qr : undefined}
//       />
//     </Layout>
//   );
// });

// // Start session route
// admin.post("/:sessionId/start", async (c) => {
//   await startSession(c);
//   return c.redirect(`/admin/${c.req.param("sessionId")}`);
// });

// // Terminate session route
// admin.post("/:sessionId/terminate", async (c) => {
//   await terminateSession(c);
//   return c.redirect(`/admin/${c.req.param("sessionId")}`);
// });

export default admin;
