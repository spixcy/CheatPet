import { Icon } from "./Icon";

interface BrandHeaderProps {
  surface: "popup" | "workspace" | "options";
  onSettings?: () => void;
  onOpenWorkspace?: () => void;
}

export function BrandHeader({ surface, onSettings, onOpenWorkspace }: BrandHeaderProps) {
  return (
    <header className="brand-row">
      <span className="brand-mark" aria-hidden="true">Q</span>
      <div className="brand-copy">
        <p className="brand-name">CheatPet</p>
        <p className="brand-subtitle">Study Desk</p>
      </div>
      <div className="brand-actions">
        <span className="status-pill"><span /> Private by default</span>
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
