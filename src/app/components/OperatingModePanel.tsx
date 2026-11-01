import { useState, type ReactNode } from "react";

type Mode = "manual" | "automatic";

export function OperatingModePanel({ children, result }: { children: ReactNode; result?: ReactNode }) {
  const [mode, setMode] = useState<Mode>("manual");

  return <section className="mode-panel" aria-label="Operating mode">
    <div className="mode-heading"><strong>Operating mode</strong><span>{mode === "manual" ? "Manual" : "Automatic practice"}</span></div>
    <div className="mode-switch" role="group" aria-label="Choose operating mode">
      <button type="button" className={mode === "manual" ? "is-active" : ""} onClick={() => setMode("manual")}>Manual</button>
      <button type="button" className={mode === "automatic" ? "is-active" : ""} onClick={() => setMode("automatic")}>Automatic practice</button>
    </div>
    {mode === "manual" && children}
    {mode === "automatic" && <div className="simulator-panel">
      <div className="automation-status"><span />Automatic practice unavailable</div>
      <p className="simulator-question">No authorized practice simulator is connected. Automatic question detection is not active. Use Manual mode to analyze a question you enter, or capture a screen from the toolbar popup.</p>
      <small>CheatPet does not monitor other websites or submit answers.</small>
    </div>}
    {result}
  </section>;
}

