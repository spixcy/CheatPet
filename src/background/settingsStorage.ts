import { DEFAULT_OPENAI_MODEL } from "../shared/providers/openai";
import { isProviderReady } from "../shared/providers/catalog";
import { ProviderError } from "../shared/providers/provider";
import type { AppSettings, ProviderId, PublicSettings } from "../shared/types";

export const SETTINGS_STORAGE_KEY = "cheatpet.providerPreferences.v1";
export const OPENAI_KEY_STORAGE_KEY = "cheatpet.openaiKey.v1";

interface ProviderPreferences {
  provider: ProviderId;
  model: string;
}

function isPreferences(value: unknown): value is ProviderPreferences {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ProviderPreferences>;
  return typeof candidate.provider === "string" && typeof candidate.model === "string";
}

async function readPreferences(): Promise<ProviderPreferences> {
  const stored = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
  const value = stored[SETTINGS_STORAGE_KEY];
  if (isPreferences(value) && isProviderReady(value.provider)) {
    const model = value.model.trim();
    if (model && model.length <= 100) return { provider: value.provider, model };
  }
  return { provider: "openai", model: DEFAULT_OPENAI_MODEL };
}

export async function readPublicSettings(): Promise<PublicSettings> {
  const [preferences, secret] = await Promise.all([
    readPreferences(),
    chrome.storage.local.get(OPENAI_KEY_STORAGE_KEY),
  ]);
  return {
    ...preferences,
    hasApiKey: typeof secret[OPENAI_KEY_STORAGE_KEY] === "string" && secret[OPENAI_KEY_STORAGE_KEY].trim().length > 0,
  };
}

export async function saveProviderPreferences(input: Pick<AppSettings, "provider" | "model">): Promise<PublicSettings> {
  const model = input.model.trim();
  if (!isProviderReady(input.provider)) {
    throw new ProviderError("That provider is not available yet.", "unavailable");
  }
  if (!model || model.length > 100 || /[\u0000-\u001f]/.test(model)) {
    throw new ProviderError("Enter a model ID between 1 and 100 characters.", "unavailable");
  }

  await chrome.storage.local.set({
    [SETTINGS_STORAGE_KEY]: { provider: input.provider, model },
  });
  return readPublicSettings();
}

export async function saveOpenAIKey(apiKey: string): Promise<{ hasApiKey: true }> {
  const normalizedKey = apiKey.trim();
  if (normalizedKey.length < 8 || normalizedKey.length > 512) {
    throw new ProviderError("Enter a valid-length API key.", "missing-key");
  }
  await chrome.storage.local.set({ [OPENAI_KEY_STORAGE_KEY]: normalizedKey });
  return { hasApiKey: true };
}

export async function removeOpenAIKey(): Promise<{ hasApiKey: false }> {
  await chrome.storage.local.remove(OPENAI_KEY_STORAGE_KEY);
  return { hasApiKey: false };
}

export async function getOpenAIKeyForRequest(): Promise<string> {
  const stored = await chrome.storage.local.get(OPENAI_KEY_STORAGE_KEY);
  const apiKey = stored[OPENAI_KEY_STORAGE_KEY];
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    throw new ProviderError("Add an OpenAI API key in Settings first.", "missing-key");
  }
  return apiKey;
}

export async function clearAllExtensionData(): Promise<{ deleted: true }> {
  await chrome.storage.local.clear();
  return { deleted: true };
}
