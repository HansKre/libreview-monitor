import React from "react";
import { ThemeToggle } from "./ThemeToggle";

interface SettingsFormProps {
  credentials: { email: string; password: string };
  setCredentials: (credentials: { email: string; password: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  saveMessage: { text: string; type: "success" | "error" } | null;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  credentials,
  setCredentials,
  onSubmit,
  saveMessage,
}) => {
  return (
    <div className="tab-pane active">
      <div className="settings-info">
        Enter your LibreView credentials to enable automatic glucose monitoring.
        Your credentials are stored securely in Chrome's local storage.
      </div>

      <ThemeToggle />

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            placeholder="Your password"
            required
          />
        </div>

        <button type="submit" className="btn">
          Save Credentials
        </button>

        {saveMessage && (
          <div
            className={
              saveMessage.type === "success" ? "success-message" : "error"
            }
          >
            {saveMessage.text}
          </div>
        )}
      </form>
    </div>
  );
};
