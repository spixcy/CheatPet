import { isProviderReady } from "../shared/providers/catalog";
import type { RuntimeRequest } from "../shared/messages";
import type { ProviderId, QuestionDraft, QuestionOption, QuestionSource } from "../shared/types";
import { validateQuestionDraft } from "../shared/validateQuestion";

export interface MessageSenderDescriptor {
  id?: string;
  url?: string;
}

export function isTrustedExtensionPage(sender: MessageSenderDescriptor, extensionId: string): boolean {
  if (sender.id !== extensionId || typeof sender.url !== "string") return false;
  try {
    const url = new URL(sender.url);
    return (
      url.protocol === "chrome-extension:" &&
      url.host === extensionId &&
      ["/index.html", "/workspace.html", "/options.html"].includes(url.pathname)
    );
  } catch {
    return false;
  }
}

function isQuestionOption(value: unknown): value is QuestionOption {
  if (typeof value !== "object" || value === null) return false;
  const option = value as Partial<QuestionOption>;
  return typeof option.id === "string" && typeof option.label === "string" && typeof option.text === "string";
}

function isQuestionDraft(value: unknown): value is QuestionDraft {
  if (typeof value !== "object" || value === null) return false;
  const draft = value as Partial<QuestionDraft>;
  const validSource: QuestionSource[] = ["manual", "selected-text", "image"];
  return (
    typeof draft.question === "string" &&
    Array.isArray(draft.options) &&
    draft.options.every(isQuestionOption) &&
    typeof draft.source === "string" &&
    validSource.includes(draft.source as QuestionSource) &&
    (draft.imageDataUrl === undefined || typeof draft.imageDataUrl === "string") &&
    (draft.imageName === undefined || typeof draft.imageName === "string")
  );
}

export function isRuntimeRequest(value: unknown): value is RuntimeRequest {
  if (typeof value !== "object" || value === null || !("type" in value)) return false;
  const request = value as Record<string, unknown>;
  const hasOnlyKeys = (...allowed: string[]) => Object.keys(request).every((key) => allowed.includes(key));
  switch (request.type) {
    case "GET_PUBLIC_SETTINGS":
      return hasOnlyKeys("type");
    case "REMOVE_API_KEY":
      return hasOnlyKeys("type");
    case "DELETE_ALL_DATA":
      return hasOnlyKeys("type");
    case "SAVE_PROVIDER_SETTINGS":
      return (
        hasOnlyKeys("type", "provider", "model") &&
        typeof request.provider === "string" &&
        isProviderReady(request.provider as ProviderId) &&
        typeof request.model === "string"
      );
    case "SAVE_API_KEY":
      return hasOnlyKeys("type", "apiKey") && typeof request.apiKey === "string";
    case "GENERATE_ANSWER":
      return hasOnlyKeys("type", "draft") && "draft" in request && isQuestionDraft(request.draft) && validateQuestionDraft(request.draft) === null;
    default:
      return false;
  }
}
