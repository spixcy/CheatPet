import { Icon } from "./Icon";

interface BrandHeaderProps {
  surface: "popup" | "workspace" | "options";
  hasApiKey: boolean;
  onSettings?: () => void;
  onOpenWorkspace?: () => void;
}

export function BrandHeader({ surface, hasApiKey, onSettings, onOpenWorkspace }: BrandHeaderProps) {
  return (
    <header className="brand-row">
      <span className="brand-mark" aria-hidden="true">Q</span>
      <div className="brand-copy">
        <p className="brand-name">CheatPet</p>
        <p className="brand-subtitle">Study Desk</p>
      </div>
      <div className="brand-actions">
        <span className={`status-pill${hasApiKey ? " is-connected" : ""}`} title={hasApiKey ? "OpenAI API key is saved for this browser session" : "Add an OpenAI API key in Settings"}><span />{hasApiKey ? "Key ready" : "Set up OpenAI"}</span>
        {surface === "popup" && onOpenWorkspace && (
          <button className="icon-button" type="button" aria-label="Open full workspace" onClick={onOpenWorkspace}>
            <Icon name="external" />
          </button>
        )}
        {surface !== "options" && onSettings && (
          <button className="icon-button" type="button" aria-label="Open settings" onClick={onSettings}>
            <Icon name="settings" />
          </button>
        )}
      </div>
    </header>
  );
}
