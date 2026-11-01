import type { AppView } from "../view";
import { appViews } from "../view";
import { Icon } from "./Icon";

interface NavigationProps {
  activeView: AppView;
  onSelect: (view: AppView) => void;
}

export function Navigation({ activeView, onSelect }: NavigationProps) {
  return (
    <nav className="app-navigation" aria-label="Study Desk">
      {appViews.map((item) => (
        <button
          className={`nav-item${activeView === item.id ? " is-active" : ""}`}
          key={item.id}
          type="button"
          aria-current={activeView === item.id ? "page" : undefined}
          onClick={() => onSelect(item.id)}
        >
          <Icon name={item.icon} size={17} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
