import type { AIAnswer, ConfidenceLevel } from "../types";
import { ProviderError } from "./provider";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function extractResponseText(response: unknown): string {
  if (!isRecord(response) || !Array.isArray(response.output)) {
    throw new ProviderError("OpenAI returned an unexpected response.", "invalid-response");
  }

  const parts: string[] = [];
  for (const item of response.output) {
    if (!isRecord(item) || item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (isRecord(content) && content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
      if (isRecord(content) && content.type === "refusal") {
        throw new ProviderError("OpenAI could not answer this question.", "unavailable");
      }
    }
  }

  const text = parts.join("\n").trim();
  if (!text) throw new ProviderError("OpenAI returned no answer text.", "invalid-response");
  return text;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean);
}

export function parseStructuredAnswer(text: string, optionLabels: string[]): AIAnswer {
  let decoded: unknown;
  try {
    decoded = JSON.parse(text);
  } catch {
    throw new ProviderError("OpenAI's answer was not valid structured data. Try again.", "invalid-response");
  }

  if (!isRecord(decoded)) {
    throw new ProviderError("OpenAI's answer was missing required details. Try again.", "invalid-response");
  }

  const answerSummary = stringValue(decoded.answerSummary);
  const explanation = stringValue(decoded.explanation);
  const confidenceReason = stringValue(decoded.confidenceReason);
  if (!answerSummary || !explanation || !confidenceReason) {
    throw new ProviderError("OpenAI's answer was missing required details. Try again.", "invalid-response");
  }

  const confidenceValue = decoded.confidence;
  const confidence: ConfidenceLevel =
    confidenceValue === "low" || confidenceValue === "high" ? confidenceValue : "medium";
  const validLabels = new Set(optionLabels.map((label) => label.trim().toLocaleUpperCase()));
  const recommendedLabels = stringList(decoded.recommendedLabels)
    .map((label) => label.toLocaleUpperCase())
    .filter((label) => validLabels.size === 0 || validLabels.has(label));

  return {
    answerSummary,
    recommendedLabels: [...new Set(recommendedLabels)],
    explanation,
    steps: stringList(decoded.steps),
    confidence,
    confidenceReason,
    caveats: stringList(decoded.caveats),
  };
}
