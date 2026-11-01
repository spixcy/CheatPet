import type { FormEvent } from "react";
import type { QuestionSource } from "../../shared/types";
import { Icon } from "./Icon";

interface QuestionComposerProps {
  value: string;
  source: QuestionSource;
  imageDataUrl?: string;
  imageName?: string;
  hasApiKey: boolean;
  isGenerating: boolean;
  error?: string;
  onChange: (value: string) => void;
  onCapture: () => void;
  onRemoveImage: () => void;
  onGenerate: () => void;
  onOpenSettings: () => void;
}

export function QuestionComposer(props: QuestionComposerProps) {
  const {
    value,
    source,
    imageDataUrl,
    imageName,
    hasApiKey,
    isGenerating,
    error,
    onChange,
    onCapture,
    onRemoveImage,
    onGenerate,
    onOpenSettings,
  } = props;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasApiKey) onGenerate();
    else onOpenSettings();
  }

  return (
    <form className="question-composer surface-card" onSubmit={submit}>
      <div className="composer-heading">
        <div>
          <p className="eyebrow">MANUAL SCREEN ANALYSIS</p>
          <h1>Capture a practice question</h1>
          <p className="muted">Capture the visible browser tab, review it, then request an explanation.</p>
        </div>
        <span className={`source-badge source-badge--${source}`}>
          {source === "selected-text" ? "Selected text" : imageDataUrl ? "Question image" : "Manual input"}
        </span>
      </div>

      <label className="field-label" htmlFor="practice-question">Optional context</label>
      <textarea
        id="practice-question"
        className="question-textarea"
        value={value}
        maxLength={8_000}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder="Add a note to help explain the screenshot (optional)"
        rows={3}
      />
      <div className="input-meta"><span>Choice labels like A), A., and (A) are recognized.</span><span>{value.length.toLocaleString()} / 8,000</span></div>
      <div className="image-actions" aria-label="Question image actions">
        <button className="secondary-button capture-button" type="button" onClick={onCapture} disabled={isGenerating}>
          <Icon name="image" size={16} /> Capture screen
        </button>
      </div>
      {imageDataUrl && <div className="image-preview-card screenshot-preview">
        <img src={imageDataUrl} alt="Captured browser tab preview" />
        <div className="image-preview-copy"><strong>{imageName || "Captured screen"}</strong><span>Sent only after you choose Analyze.</span></div>
        <button className="icon-button icon-button--quiet" type="button" aria-label="Discard screenshot" onClick={onRemoveImage}><Icon name="close" /></button>
      </div>}

      <div className="composer-actions">
        <button className="primary-button" type="submit" disabled={isGenerating}>
          <Icon name="spark" size={16} />
          {isGenerating ? "Analyzing screen…" : hasApiKey ? imageDataUrl ? "Analyze screenshot" : "Capture a screenshot first" : "Set up OpenAI"}
        </button>
      </div>

      {!hasApiKey && (
        <div className="setup-hint">
          <Icon name="lock" size={15} />
          <span>Add your own API key in Settings to request an explanation.</span>
          <button type="button" onClick={onOpenSettings}>Settings</button>
        </div>
      )}
      {error && <div className="inline-error" role="alert"><Icon name="warning" size={16} />{error}</div>}
    </form>
  );
}
