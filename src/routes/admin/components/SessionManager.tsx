import { FC } from "hono/jsx";
import * as qrcode from "qr-image";

interface SessionManagerProps {
  sessionId: string;
  qrCode?: string; // Presumably a URL or some string data for QR encoding
}

const SessionManager: FC<SessionManagerProps> = ({ sessionId, qrCode }) => {
  let qrCodeBase64 = "";

  if (qrCode) {
    // Generate the QR code as a Buffer with 'png' type if qrCode data is present
    const qrCodeBuffer: Buffer = qrcode.imageSync(qrCode, {
      type: "png",
    }) as Buffer;
    // Convert the Buffer to base64 for embedding in an img tag
    qrCodeBase64 = qrCodeBuffer.toString("base64");
  }

  return (
    <div>
      <h2>Session: {sessionId}</h2>

      <div className="session-controls">
        <form action={`/admin/${sessionId}/start`} method="post">
          <button className="button" type="submit">
            Start Session
          </button>
        </form>

        <form action={`/admin/${sessionId}/terminate`} method="post">
          <button className="button danger" type="submit">
            Terminate Session
          </button>
        </form>
      </div>

      {qrCode && (
        <div className="qr-container">
          <h3>Scan QR Code</h3>
          <img
            src={`data:image/png;base64,${qrCodeBase64}`}
            alt="QR Code"
            className="qr-image"
          />
        </div>
      )}
    </div>
  );
};

export default SessionManager;
