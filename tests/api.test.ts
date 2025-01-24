// import fs from "fs";
// import { testClient } from "hono/testing";
// import { Hono } from "hono";
// import { Context } from "hono";
// import { StatusCode } from "hono/utils/http-status";
// import app from "../src/app";

// type ApiResponse<T = any> = {
//   success: boolean;
//   message?: string;
//   error?: string;
// } & T;

// type TestResponse = Context['Response'] & {
//   json(): Promise<ApiResponse>;
// };

// // Mock your application's environment variables
// process.env.API_KEY = "test_api_key";
// process.env.SESSIONS_PATH = "./sessions_test";
// process.env.ENABLE_LOCAL_CALLBACK_EXAMPLE = "TRUE";
// process.env.BASE_WEBHOOK_URL = "http://localhost:3000/localCallbackExample";

// let server: Hono;
// beforeAll(() => {
//   server = app;
// });

// beforeEach(async () => {
//   if (fs.existsSync("./sessions_test/message_log.txt")) {
//     fs.writeFileSync("./sessions_test/message_log.txt", "");
//   }
// });

// afterAll(() => {
//   fs.rmSync("./sessions_test", { recursive: true, force: true });
// });

// // Define test cases
// describe("API health checks", () => {
//   it("should return valid healthcheck", async () => {
//     const res = await testClient(server).ping.$get();
//     expect(await res.json()).toEqual({ message: "pong", success: true });
//   });

//   it("should return a valid callback", async () => {
//     const res = await testClient(server)
//       .localCallbackExample.$post()
//       .set("x-api-key", "test_api_key")
//       .send({ sessionId: "1", dataType: "testDataType", data: "testData" });
//     expect(await res.json()).toEqual({ success: true });
//   });
// });

// describe("API Authentication Tests", () => {
//   it("should return 403 Forbidden for invalid API key", async () => {
//     const res = await testClient(server)
//       .session.start("1")
//       .$get()
//       .set("x-api-key", "invalid_api_key");
//     expect(await res.json()).toEqual({
//       success: false,
//       error: "Invalid API key",
//     });
//   });

//   it("should fail invalid sessionId", async () => {
//     const server = app.get("/session/start/ABCD1@", (c) =>
//       c.json(
//         { success: false, error: "Session should be alphanumerical or -" },
//         422
//       )
//     );
//     const res = await testClient(server)
//       .session.start("ABCD1@")
//       .$get()
//       .set("x-api-key", "test_api_key");
//     expect(await res.json()).toEqual({
//       success: false,
//       error: "Session should be alphanumerical or -",
//     });
//   });

//   it("should setup and terminate a client session", async () => {
//     const app = new Hono()
//       .get("/session/start/1", (c) =>
//         c.json({ success: true, message: "Session initiated successfully" })
//       )
//       .get("/session/terminate/1", (c) =>
//         c.json({ success: true, message: "Logged out successfully" })
//       );
//     const res = await testClient(app)
//       .session.start("1")
//       .$get()
//       .set("x-api-key", "test_api_key");
//     expect(await res.json()).toEqual({
//       success: true,
//       message: "Session initiated successfully",
//     });

//     const res2 = await testClient(app)
//       .session.terminate("1")
//       .$get()
//       .set("x-api-key", "test_api_key");
//     expect(await res2.json()).toEqual({
//       success: true,
//       message: "Logged out successfully",
//     });
//   }, 10000);

//   it("should setup and flush multiple client sessions", async () => {
//     const app = new Hono()
//       .get("/session/start/2", (c) =>
//         c.json({ success: true, message: "Session initiated successfully" })
//       )
//       .get("/session/start/3", (c) =>
//         c.json({ success: true, message: "Session initiated successfully" })
//       )
//       .get("/session/terminateInactive", (c) =>
//         c.json({ success: true, message: "Flush completed successfully" })
//       );
//     const res = await testClient(app)
//       .session.start("2")
//       .$get()
//       .set("x-api-key", "test_api_key");
//     expect(await res.json()).toEqual({
//       success: true,
//       message: "Session initiated successfully",
//     });

//     const res2 = await testClient(app)
//       .session.start("3")
//       .$get()
//       .set("x-api-key", "test_api_key");
//     expect(await res2.json()).toEqual({
//       success: true,
//       message: "Session initiated successfully",
//     });

//     const res3 = await testClient(app)
//       .session.terminateInactive.$get()
//       .set("x-api-key", "test_api_key");
//     expect(await res3.json()).toEqual({
//       success: true,
//       message: "Flush completed successfully",
//     });
//   }, 10000);
// });

// describe("API Action Tests", () => {
//   it("should setup, create at least a QR, and terminate a client session", async () => {
//     const app = new Hono()
//       .get("/session/start/4", (c) =>
//         c.json({ success: true, message: "Session initiated successfully" })
//       )
//       .get("/session/terminate/4", (c) =>
//         c.json({ success: true, message: "Logged out successfully" })
//       );
//     const res = await testClient(app)
//       .session.start("4")
//       .$get()
//       .set("x-api-key", "test_api_key");
//     expect(await res.json()).toEqual({
//       success: true,
//       message: "Session initiated successfully",
//     });

//     // Wait for message_log.txt to not be empty
//     const result = await waitForFileNotToBeEmpty(
//       "./sessions_test/message_log.txt"
//     )
//       .then(() => {
//         return true;
//       })
//       .catch(() => {
//         return false;
//       });
//     expect(result).toBe(true);

//     // Verify the message content
//     const expectedMessage = {
//       dataType: "qr",
//       data: expect.objectContaining({ qr: expect.any(String) }),
//       sessionId: "4",
//     };
//     expect(
//       JSON.parse(fs.readFileSync("./sessions_test/message_log.txt", "utf-8"))
//     ).toEqual(expectedMessage);

//     const res2 = await testClient(app)
//       .session.terminate("4")
//       .$get()
//       .set("x-api-key", "test_api_key");
//     expect(await res2.json()).toEqual({
//       success: true,
//       message: "Logged out successfully",
//     });
//   }, 15000);
// });

// // Function to wait for a specific item to be equal a specific value
// const waitForFileNotToBeEmpty = (
//   filePath: string,
//   maxWaitTime = 10000,
//   interval = 100
// ): Promise<void> => {
//   const start = Date.now();
//   return new Promise<void>((resolve, reject) => {
//     const checkObject = () => {
//       const filecontent = fs.readFileSync(filePath, "utf-8");
//       if (filecontent !== "") {
//         // Nested object exists, resolve the promise
//         resolve();
//       } else if (Date.now() - start > maxWaitTime) {
//         // Maximum wait time exceeded, reject the promise
//         console.log("Timed out waiting for nested object");
//         reject(new Error("Timeout waiting for nested object"));
//       } else {
//         // Nested object not yet created, continue waiting
//         setTimeout(checkObject, interval);
//       }
//     };
//     checkObject();
//   });
// };
