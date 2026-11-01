import { useState, type FormEvent } from "react";
import type { ProviderId, PublicSettings } from "../../shared/types";
import { providerCatalog } from "../../shared/providers/catalog";
import { Icon } from "./Icon";

interface SettingsPanelProps {
  settings: PublicSettings;
  busy: boolean;
  error?: string;
  onSaveProvider: (provider: ProviderId, model: string) => Promise<void>;
  onSaveKey: (apiKey: string) => Promise<void>;
  onRemoveKey: () => Promise<void>;
  onDeleteAll: () => Promise<void>;
}

export function SettingsPanel({ settings, busy, error, onSaveProvider, onSaveKey, onRemoveKey, onDeleteAll }: SettingsPanelProps) {
  const [provider, setProvider] = useState<ProviderId>(settings.provider);
  const [model, setModel] = useState(settings.model);
  const [apiKey, setApiKey] = useState("");
  const [keyVisible, setKeyVisible] = useState(false);
  const [notice, setNotice] = useState("");

  async function saveProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    await onSaveProvider(provider, model);
    setNotice("Provider settings saved.");
  }

  async function saveKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    await onSaveKey(apiKey);
    setApiKey("");
    setNotice("API key saved on this browser profile.");
  }

  async function removeKey() {
    setNotice("");
    await onRemoveKey();
    setNotice("API key removed.");
  }

  async function deleteEverything() {
    if (!window.confirm("Delete the saved API key, provider settings, practice history, and saved explanations from this browser profile?")) return;
    await onDeleteAll();
    setApiKey("");
    setProvider("openai");
    setNotice("All CheatPet data was deleted from this browser profile.");
  }

  return (
    <section className="settings-view">
      <header className="view-heading">
        <div>
          <p className="eyebrow">PREFERENCES</p>
          <h1>Settings</h1>
          <p className="muted">Choose the model that will explain the practice questions you submit.</p>
        </div>
      </header>

      <form className="settings-card surface-card" onSubmit={saveProvider}>
        <div className="settings-card-heading">
          <span className="settings-icon"><Icon name="spark" size={18} /></span>
          <div><h2>AI provider</h2><p>Requests go directly from this extension to the selected provider.</p></div>
        </div>
        <label className="field-label" htmlFor="provider-select">Provider</label>
        <select id="provider-select" className="text-input" value={provider} onChange={(event) => setProvider(event.currentTarget.value as ProviderId)}>
          {providerCatalog.map((entry) => <option key={entry.id} value={entry.id} disabled={entry.status !== "ready"}>{entry.name}{entry.status === "planned" ? " · planned" : ""}</option>)}
        </select>
        <p className="field-help">Gemini, Anthropic, OpenRouter, and Ollama adapters are planned; OpenAI is available today.</p>
        <label className="field-label" htmlFor="model-id">Model ID</label>
        <input id="model-id" className="text-input" value={model} onChange={(event) => setModel(event.currentTarget.value)} maxLength={100} required spellCheck={false} />
        <button className="secondary-button" type="submit" disabled={busy}><Icon name="check" size={16} /> Save provider settings</button>
      </form>

      <form className="settings-card surface-card" onSubmit={saveKey}>
        <div className="settings-card-heading">
          <span className="settings-icon"><Icon name="lock" size={18} /></span>
          <div><h2>OpenAI API key</h2><p>{settings.hasApiKey ? "A key is saved for this browser profile." : "Add your own key to request explanations."}</p></div>
          <span className={`key-status${settings.hasApiKey ? " is-ready" : ""}`}><span />{settings.hasApiKey ? "Connected" : "Not set"}</span>
        </div>
        <label className="field-label" htmlFor="api-key">API key</label>
        <div className="secret-input-row">
          <input id="api-key" className="text-input" type={keyVisible ? "text" : "password"} value={apiKey} onChange={(event) => setApiKey(event.currentTarget.value)} placeholder={settings.hasApiKey ? "Enter a replacement key" : "Paste your OpenAI API key"} autoComplete="new-password" spellCheck={false} />
          <button className="secondary-button visibility-button" type="button" onClick={() => setKeyVisible((visible) => !visible)}>{keyVisible ? "Hide" : "Show"}</button>
        </div>
        <div className="settings-actions">
          <button className="primary-button" type="submit" disabled={busy || apiKey.trim().length === 0}><Icon name="check" size={16} /> Save API key</button>
          {settings.hasApiKey && <button className="text-button danger-text" type="button" disabled={busy} onClick={() => void removeKey()}>Remove key</button>}
        </div>
        <p className="privacy-note"><Icon name="shield" size={16} /> The key stays in extension storage on this device. CheatPet does not encrypt it; it is sent directly to OpenAI only when you request an explanation. It is never returned to a webpage.</p>
      </form>

      <div className="settings-card settings-card--privacy surface-card">
        <div className="settings-card-heading">
          <span className="settings-icon"><Icon name="shield" size={18} /></span>
          <div><h2>Data and privacy</h2><p>No CheatPet account or analytics service is used.</p></div>
        </div>
        <p className="field-help">Questions and explanations are saved locally in Chrome. When you choose Explain, the question and any attached image are sent to OpenAI under your API account and its data controls.</p>
        <button className="text-button danger-text" type="button" disabled={busy} onClick={() => void deleteEverything()}><Icon name="trash" size={16} /> Delete all local data</button>
      </div>

      {(notice || error) && <p className={error ? "inline-error" : "settings-notice"} role={error ? "alert" : "status"}>{error ?? notice}</p>}
    </section>
  );
}
