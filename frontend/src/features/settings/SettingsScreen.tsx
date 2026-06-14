import { API_BASE } from "@/src/lib/api";

export function SettingsScreen() {
  return (
    <div className="screen-stack">
      <section className="form-shell">
        <div className="form-header">
          <h2>System Settings</h2>
          <p>API connection, security, and user preferences</p>
        </div>
        <div className="settings-grid">
          <div>
            <strong>Backend API</strong>
            <span>{API_BASE}</span>
          </div>
          <div>
            <strong>Authentication</strong>
            <span>JWT bearer token</span>
          </div>
          <div>
            <strong>Design Source</strong>
            <span>Imported Figma exports</span>
          </div>
          <div>
            <strong>Mode</strong>
            <span>Live backend data after login</span>
          </div>
        </div>
      </section>
    </div>
  );
}
