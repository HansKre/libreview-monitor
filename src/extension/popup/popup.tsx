import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { useGlucoseData } from "./hooks/useGlucoseData";
import { useCredentials } from "./hooks/useCredentials";
import { GlucoseStatus } from "./components/GlucoseStatus";
import { GlucoseChart } from "./components/GlucoseChart";
import { SettingsForm } from "./components/SettingsForm";
import { ThemeProvider } from "./contexts/ThemeContext";

const PopupApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState("graph");
  const { glucoseData, loading, error, forceUpdate } =
    useGlucoseData(currentTab);
  const { credentials, setCredentials, saveCredentials, saveMessage } =
    useCredentials();

  return (
    <div className="container">
      <div className="header">
        <h1>
          <img
            src="../icons/icon128.png"
            alt=""
            width="24"
            height="24"
            style={{ verticalAlign: "middle", marginRight: "8px" }}
          />{" "}
          LibreView Glucose Monitor
        </h1>
      </div>

      <div className="tabs">
        <button
          className={`tab ${currentTab === "graph" ? "active" : ""}`}
          onClick={() => setCurrentTab("graph")}
        >
          Graph
        </button>
        <button
          className={`tab ${currentTab === "settings" ? "active" : ""}`}
          onClick={() => setCurrentTab("settings")}
        >
          Settings
        </button>
      </div>

      <div className="tab-content">
        {currentTab === "graph" && (
          <div className="tab-pane active">
            <GlucoseStatus
              value={glucoseData.value}
              lastUpdate={glucoseData.lastUpdate}
              loading={loading}
              onRefresh={forceUpdate}
            />

            <GlucoseChart
              data={glucoseData.data || []}
              currentValue={glucoseData.value}
              error={error}
              loading={loading}
            />
          </div>
        )}

        {currentTab === "settings" && (
          <SettingsForm
            credentials={credentials}
            setCredentials={setCredentials}
            onSubmit={saveCredentials}
            saveMessage={saveMessage}
          />
        )}
      </div>
    </div>
  );
};

// Initialize the React app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <ThemeProvider>
      <PopupApp />
    </ThemeProvider>,
  );
}
