import { FC } from 'hono/jsx'

const Layout: FC = ({ children }) => {
  return (
    <html>
      <head>
        <title>WhatsApp API Admin</title>
        <style>{`
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .qr-container {
            text-align: center;
            margin: 20px 0;
          }
          .qr-image {
            max-width: 300px;
            margin: 0 auto;
          }
          .button {
            background: #25D366;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
          }
          .button.danger {
            background: #DC3545;
          }
          .session-controls {
            display: flex;
            gap: 10px;
            margin: 10px 0;
          }
        `}</style>
      </head>
      <body>
        <div class="container">
          {children}
        </div>
      </body>
    </html>
  )
}

export default Layout