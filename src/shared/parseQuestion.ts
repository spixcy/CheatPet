import type { QuestionOption } from "./types";

export interface ParsedQuestion {
  question: string;
  options: QuestionOption[];
}

const optionPattern = /^\s*(?:\(([A-Za-z]|\d{1,2})\)|([A-Za-z]|\d{1,2})[.):])\s+(.+?)\s*$/;

/** Extracts common A/B/C or 1/2/3 option formats from user-provided text. */
export function parseQuestionInput(rawText: string): ParsedQuestion {
  const lines = rawText.replace(/\r\n?/g, "\n").split("\n");
  const questionLines: string[] = [];
  const options: QuestionOption[] = [];
  let currentOption: QuestionOption | undefined;

  for (const sourceLine of lines) {
    const line = sourceLine.trim();
    if (!line) continue;

    const match = line.match(optionPattern);
    if (match) {
      const label = (match[1] ?? match[2]).toUpperCase();
      currentOption = {
        id: `option-${options.length + 1}`,
        label,
        text: match[3].trim(),
      };
      options.push(currentOption);
      continue;
    }

    if (currentOption) {
      currentOption.text = `${currentOption.text} ${line}`;
    } else {
      questionLines.push(line);
    }
  }

  if (options.length < 2) {
    return { question: rawText.trim(), options: [] };
  }

  return {
    question: questionLines.join(" ").replace(/\s+/g, " ").trim(),
    options,
  };
}
