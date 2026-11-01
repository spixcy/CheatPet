import type { AIAnswer, AppSettings, PublicSettings, QuestionDraft } from "./types";

interface RequestPayloads {
  GET_PUBLIC_SETTINGS: Record<never, never>;
  SAVE_PROVIDER_SETTINGS: Pick<AppSettings, "provider" | "model">;
  SAVE_API_KEY: { apiKey: string };
  REMOVE_API_KEY: Record<never, never>;
  GENERATE_ANSWER: { draft: QuestionDraft };
  DELETE_ALL_DATA: Record<never, never>;
}

export type RuntimeRequest = {
  [K in keyof RequestPayloads]: { type: K } & RequestPayloads[K];
}[keyof RequestPayloads];

export interface RuntimeResponseMap {
  GET_PUBLIC_SETTINGS: PublicSettings;
  SAVE_PROVIDER_SETTINGS: PublicSettings;
  SAVE_API_KEY: { hasApiKey: true };
  REMOVE_API_KEY: { hasApiKey: false };
  GENERATE_ANSWER: { answer: AIAnswer; provider: "openai"; model: string };
  DELETE_ALL_DATA: { deleted: true };
}

export type RuntimeReply<T> = { ok: true; data: T } | { ok: false; error: RuntimeErrorInfo };

export interface RuntimeErrorInfo {
  code: string;
  message: string;
  retryable: boolean;
}

export class RuntimeBridgeError extends Error {
  constructor(public readonly details: RuntimeErrorInfo) {
    super(details.message);
    this.name = "RuntimeBridgeError";
  }
}

export async function sendRuntimeRequest<T extends keyof RuntimeResponseMap>(
  request: Extract<RuntimeRequest, { type: T }>,
): Promise<RuntimeResponseMap[T]> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    throw new RuntimeBridgeError({
      code: "extension-unavailable",
      message: "Open this page from the installed Chrome extension to use browser features.",
      retryable: false,
    });
  }

  const reply = (await chrome.runtime.sendMessage(request)) as RuntimeReply<RuntimeResponseMap[T]>;
  if (!reply || typeof reply !== "object" || !("ok" in reply)) {
    throw new RuntimeBridgeError({
      code: "invalid-response",
      message: "The extension did not return a response. Reload it and try again.",
      retryable: true,
    });
  }
  if (!reply.ok) throw new RuntimeBridgeError(reply.error);
  return reply.data;
}
