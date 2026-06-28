import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/App.jsx";

import { GoogleOAuthProvider } from "@react-oauth/google";

// Handle Vite chunk load errors gracefully (e.g. when Vercel deploys a new version and old chunks are deleted)
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('Failed to fetch dynamically imported module')) {
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
