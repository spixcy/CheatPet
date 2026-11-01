import type { PracticeRecord } from "../../shared/types";
import { Icon } from "./Icon";

interface HistoryListProps {
  records: PracticeRecord[];
  savedOnly: boolean;
  onOpen: (record: PracticeRecord) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
  onPractice: () => void;
}

export function HistoryList({ records, savedOnly, onOpen, onSave, onDelete, onPractice }: HistoryListProps) {
  const visibleRecords = savedOnly ? records.filter((record) => record.saved) : records;
  const heading = savedOnly ? "Saved explanations" : "Practice history";

  return (
    <section className="history-view">
      <header className="view-heading">
        <div>
          <p className="eyebrow">YOUR DEVICE</p>
          <h1>{heading}</h1>
          <p className="muted">{savedOnly ? "Keep useful explanations close for review." : "Your latest explanations are stored in this browser profile."}</p>
        </div>
        {!savedOnly && records.length > 0 && <span className="record-count">{records.length} / 100</span>}
      </header>

      {visibleRecords.length === 0 ? (
        <div className="empty-state surface-card">
          <span className="empty-state-icon"><Icon name={savedOnly ? "bookmark" : "history"} size={22} /></span>
          <h2>{savedOnly ? "Nothing saved yet" : "Your history is ready when you are"}</h2>
          <p>{savedOnly ? "Save an explanation to make it easy to revisit." : "Ask for an explanation and it will appear here."}</p>
          <button className="secondary-button" type="button" onClick={onPractice}><Icon name="spark" size={16} /> Start a practice question</button>
        </div>
      ) : (
        <div className="history-list">
          {visibleRecords.map((record) => (
            <article className="history-card surface-card" key={record.id}>
              <button className="history-card-main" type="button" onClick={() => onOpen(record)}>
                <span className="history-card-meta">{new Date(record.createdAt).toLocaleString()} · {record.source.replace("-", " ")}</span>
                <strong>{record.answerSummary}</strong>
                <span className="history-question">{record.question || "Question provided as an image"}</span>
              </button>
              <div className="history-card-actions">
                <button className={`icon-button${record.saved ? " is-saved" : ""}`} type="button" aria-label={record.saved ? "Remove saved explanation" : "Save explanation"} aria-pressed={record.saved} onClick={() => onSave(record.id)}>
                  <Icon name="bookmark" size={17} />
                </button>
                <button className="icon-button icon-button--danger" type="button" aria-label="Delete explanation" onClick={() => onDelete(record.id)}>
                  <Icon name="trash" size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
