export type ProviderId = "openai" | "gemini" | "anthropic" | "openrouter" | "ollama";

export type ConfidenceLevel = "low" | "medium" | "high";

export type QuestionSource = "manual" | "selected-text" | "image";

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface QuestionDraft {
  question: string;
  options: QuestionOption[];
  source: QuestionSource;
  imageDataUrl?: string;
  imageName?: string;
}

export interface AIAnswer {
  answerSummary: string;
  recommendedLabels: string[];
  explanation: string;
  steps: string[];
  confidence: ConfidenceLevel;
  confidenceReason: string;
  caveats: string[];
}

export interface PracticeRecord extends AIAnswer {
  id: string;
  createdAt: number;
  question: string;
  options: QuestionOption[];
  source: QuestionSource;
  provider: ProviderId;
  model: string;
  saved: boolean;
}

export interface AppSettings {
  provider: ProviderId;
  model: string;
  apiKey: string;
}

export interface PublicSettings {
  provider: ProviderId;
  model: string;
  hasApiKey: boolean;
}

export interface AppData {
  settings: AppSettings;
  history: PracticeRecord[];
}
