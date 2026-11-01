import type { AIAnswer, ProviderId, QuestionDraft } from "../types";

export interface ProviderRequest {
  draft: QuestionDraft;
  model: string;
  apiKey: string;
  fetcher?: typeof fetch;
  signal?: AbortSignal;
}

export interface AIProviderAdapter {
  id: ProviderId;
  label: string;
  supportsImages: boolean;
  generateAnswer(request: ProviderRequest): Promise<AIAnswer>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly code: "missing-key" | "unauthorized" | "rate-limited" | "network" | "invalid-response" | "unavailable",
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
