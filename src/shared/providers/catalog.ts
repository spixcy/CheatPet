import type { ProviderId } from "../types";

export type ProviderStatus = "ready" | "planned";

export interface ProviderInfo {
  id: ProviderId;
  name: string;
  status: ProviderStatus;
  detail: string;
}

export const providerCatalog: readonly ProviderInfo[] = [
  { id: "openai", name: "OpenAI", status: "ready", detail: "Direct Responses API requests with text and image input." },
  { id: "gemini", name: "Gemini", status: "planned", detail: "Planned provider adapter." },
  { id: "anthropic", name: "Anthropic", status: "planned", detail: "Planned provider adapter." },
  { id: "openrouter", name: "OpenRouter", status: "planned", detail: "Planned provider adapter." },
  { id: "ollama", name: "Ollama", status: "planned", detail: "Planned local provider adapter." },
];

export function isProviderReady(provider: ProviderId): boolean {
  return providerCatalog.some((entry) => entry.id === provider && entry.status === "ready");
}

export function getProviderInfo(provider: ProviderId): ProviderInfo | undefined {
  return providerCatalog.find((entry) => entry.id === provider);
}
