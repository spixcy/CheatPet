import { clearAllExtensionData, getOpenAIKeyForRequest, readPublicSettings, removeOpenAIKey, saveOpenAIKey, saveProviderPreferences } from "./settingsStorage";
import { isProviderReady } from "../shared/providers/catalog";
import { openAIProvider } from "../shared/providers/openai";
import { ProviderError } from "../shared/providers/provider";
import type { RuntimeReply, RuntimeRequest, RuntimeResponseMap } from "../shared/messages";
import { isRuntimeRequest, isTrustedExtensionPage } from "./messageGuards";

const storageAccessReady = chrome.storage.local
  .setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" })
  .then(() => true)
  .catch(() => false);

chrome.runtime.onInstalled.addListener(() => {
  void chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" }).catch(() => undefined);
});

function failure<T>(code: string, message: string, retryable = false): RuntimeReply<T> {
  return { ok: false, error: { code, message, retryable } };
}

function toRuntimeError<T>(error: unknown): RuntimeReply<T> {
  if (error instanceof ProviderError) {
    return failure(error.code, error.message, error.retryable);
  }
  return failure("extension-error", "The extension could not complete that action. Please try again.", true);
}

async function handleRequest(
  request: RuntimeRequest,
): Promise<RuntimeResponseMap[RuntimeRequest["type"]]> {
  switch (request.type) {
    case "GET_PUBLIC_SETTINGS":
      return readPublicSettings();
    case "SAVE_PROVIDER_SETTINGS":
      return saveProviderPreferences(request);
    case "SAVE_API_KEY":
      return saveOpenAIKey(request.apiKey);
    case "REMOVE_API_KEY":
      return removeOpenAIKey();
    case "DELETE_ALL_DATA":
      return clearAllExtensionData();
    case "GENERATE_ANSWER": {
      const settings = await readPublicSettings();
      if (settings.provider !== "openai") {
        throw new ProviderError("The selected provider is not available yet.", "unavailable");
      }
      const apiKey = await getOpenAIKeyForRequest();
      const answer = await openAIProvider.generateAnswer({
        draft: request.draft,
        model: settings.model,
        apiKey,
      });
      return {
        answer,
        provider: "openai",
        model: settings.model,
      };
    }
  }
}

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  if (!isTrustedExtensionPage(sender, chrome.runtime.id)) {
    sendResponse(failure("untrusted-sender", "This request must come from a Study Desk extension page."));
    return;
  }
  if (!isRuntimeRequest(message)) {
    sendResponse(failure("invalid-request", "That extension request was not valid."));
    return;
  }

  void (async () => {
    if (!(await storageAccessReady)) {
      throw new ProviderError("Secure extension storage could not be initialized. Reload the extension and try again.", "unavailable");
    }
    return handleRequest(message);
  })()
    .then((data) => sendResponse({ ok: true, data }))
    .catch((error: unknown) => sendResponse(toRuntimeError(error)));

  return true;
});
