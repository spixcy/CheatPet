import type { PracticeRecord } from "../../shared/types";
import { Icon } from "./Icon";

interface AnswerResultProps {
  record: PracticeRecord;
  onSave: (id: string) => void;
  onBack: () => void;
}

export function AnswerResult({ record, onSave, onBack }: AnswerResultProps) {
  return (
    <article className="answer-result surface-card">
      <div className="result-topline">
        <button className="text-button" type="button" onClick={onBack}>
          <Icon name="arrow" size={16} /> Back to question
        </button>
        <button
          className={`secondary-button save-answer${record.saved ? " is-saved" : ""}`}
          type="button"
          aria-pressed={record.saved}
          onClick={() => onSave(record.id)}
        >
          <Icon name="bookmark" size={16} /> {record.saved ? "Saved" : "Save explanation"}
        </button>
      </div>

      <p className="eyebrow">YOUR EXPLANATION</p>
      <h1>{record.answerSummary}</h1>
      <p className="result-question">{record.question || "Question provided as an image"}</p>

      {record.recommendedLabels.length > 0 && (
        <section className="recommendation-block" aria-label="Suggested choice">
          <span className="recommendation-label">Suggested choice{record.recommendedLabels.length > 1 ? "s" : ""}</span>
          <div className="recommendation-chips">
            {record.recommendedLabels.map((label) => <span className="recommendation-chip" key={label}>{label}</span>)}
          </div>
        </section>
      )}

      <section className="explanation-section">
        <h2>Why</h2>
        <p>{record.explanation}</p>
      </section>

      {record.steps.length > 0 && (
        <section className="explanation-section">
          <h2>Work through it</h2>
          <ol className="reasoning-steps">
            {record.steps.map((step, index) => <li key={`${index}-${step}`}><span>{index + 1}</span><p>{step}</p></li>)}
          </ol>
        </section>
      )}

      <div className="confidence-note">
        <span className={`confidence-dot confidence-dot--${record.confidence}`} />
        <div>
          <strong>{record.confidence[0]!.toUpperCase() + record.confidence.slice(1)} confidence</strong>
          <p>{record.confidenceReason} Confidence is a qualitative estimate, not a measured probability.</p>
        </div>
      </div>

      {record.caveats.length > 0 && (
        <aside className="caveat-block">
          <strong>Check these details</strong>
          <ul>{record.caveats.map((caveat, index) => <li key={`${index}-${caveat}`}>{caveat}</li>)}</ul>
        </aside>
      )}

      <p className="result-attribution">Explained with {record.provider} · {record.model}</p>
    </article>
  );
}
