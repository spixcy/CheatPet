import { parseQuestionInput } from "../../shared/parseQuestion";
import type { QuestionOption } from "../../shared/types";

export function QuestionOptionPreview({ rawText }: { rawText: string }) {
  const parsed = parseQuestionInput(rawText);
  if (parsed.options.length === 0) return null;

  return (
    <section className="option-preview" aria-label={`${parsed.options.length} detected answer choices`}>
      <div className="option-preview-heading">
        <span>Choices detected</span>
        <span>{parsed.options.length}</span>
      </div>
      <ul className="option-preview-list">
        {parsed.options.map((option: QuestionOption) => (
          <li className="option-preview-item" key={option.id}>
            <span className="option-label">{option.label}</span>
            <span>{option.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
