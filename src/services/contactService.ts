import { Contact } from "whatsapp-web.js";
import { sessions } from "../sessions";

export async function getProfilePicUrl(
  sessionId: string,
  contactId: string
): Promise<string | null> {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  try {
    return await session.getProfilePicUrl(contactId);
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Get Contact
export async function getContact(
  sessionId: string,
  contactId: string
): Promise<Contact | null> {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }
  try {
    return await session.getContactById(contactId);
  } catch (error) {
    console.error(error);
    return null;
  }
}
