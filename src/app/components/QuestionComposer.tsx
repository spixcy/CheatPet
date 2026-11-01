import type { FormEvent } from "react";
import type { QuestionSource } from "../../shared/types";
import { Icon } from "./Icon";
import { QuestionImageUpload } from "./QuestionImageUpload";
import { QuestionOptionPreview } from "./QuestionOptionPreview";

interface QuestionComposerProps {
  value: string;
  source: QuestionSource;
  imageDataUrl?: string;
  imageName?: string;
  hasApiKey: boolean;
  isGenerating: boolean;
  error?: string;
  onChange: (value: string) => void;
  onImage: (dataUrl: string, name: string) => void;
  onCapture: () => void;
  onRemoveImage: () => void;
  onUseSelectedText: () => void;
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
    onImage,
    onCapture,
    onRemoveImage,
    onUseSelectedText,
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
          <p className="eyebrow">PRACTICE WORKSPACE</p>
          <h1>What would you like to understand?</h1>
          <p className="muted">Enter a practice question. Your content stays on this device until you request an explanation.</p>
        </div>
        <span className={`source-badge source-badge--${source}`}>
          {source === "selected-text" ? "Selected text" : imageDataUrl ? "Question image" : "Manual input"}
        </span>
      </div>

      <label className="field-label" htmlFor="practice-question">Question and answer choices</label>
      <textarea
        id="practice-question"
        className="question-textarea"
        value={value}
        maxLength={8_000}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={"Paste or write a practice question…\n\nA. First choice\nB. Second choice"}
        rows={7}
      />
      <div className="input-meta"><span>Choice labels like A), A., and (A) are recognized.</span><span>{value.length.toLocaleString()} / 8,000</span></div>
      <QuestionOptionPreview rawText={value} />

      <QuestionImageUpload
        imageDataUrl={imageDataUrl}
        imageName={imageName}
        onImage={onImage}
        onRemove={onRemoveImage}
      />
      <button className="secondary-button" type="button" onClick={onCapture} disabled={isGenerating}>
        <Icon name="image" size={16} /> Capture this tab
      </button>

      <div className="composer-actions">
        <button className="secondary-button" type="button" onClick={onUseSelectedText}>
          <Icon name="question" size={16} />
          Use selected practice text
        </button>
        <button className="primary-button" type="submit" disabled={isGenerating}>
          <Icon name="spark" size={16} />
          {isGenerating ? "Working through it…" : hasApiKey ? "Explain this question" : "Set up OpenAI"}
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
