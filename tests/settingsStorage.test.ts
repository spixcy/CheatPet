import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearAllExtensionData,
  getOpenAIKeyForRequest,
  OPENAI_KEY_STORAGE_KEY,
  readPublicSettings,
  removeOpenAIKey,
  saveOpenAIKey,
  saveProviderPreferences,
  SETTINGS_STORAGE_KEY,
} from "../src/background/settingsStorage";
import { ProviderError } from "../src/shared/providers/provider";

function useFakeChromeStorage(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const local = {
    get: async (key: string) => ({ [key]: data[key] }),
    set: async (values: Record<string, unknown>) => Object.assign(data, values),
    remove: async (key: string) => { delete data[key]; },
    clear: async () => { for (const key of Object.keys(data)) delete data[key]; },
  };
  vi.stubGlobal("chrome", { storage: { local } });
  return data;
}

afterEach(() => vi.unstubAllGlobals());

describe("service worker settings storage", () => {
  it("returns preferences without exposing the API key", async () => {
    const data = useFakeChromeStorage();
    await saveOpenAIKey("sk-test-secret-value");
    await saveProviderPreferences({ provider: "openai", model: "gpt-6-luna" });

    expect(data[OPENAI_KEY_STORAGE_KEY]).toBe("sk-test-secret-value");
    expect(data[SETTINGS_STORAGE_KEY]).toEqual({ provider: "openai", model: "gpt-6-luna" });
    expect(await readPublicSettings()).toEqual({ provider: "openai", model: "gpt-6-luna", hasApiKey: true });
  });

  it("requires a key before a provider request and supports removal", async () => {
    useFakeChromeStorage();
    await expect(getOpenAIKeyForRequest()).rejects.toMatchObject({ code: "missing-key" });
    await saveOpenAIKey("sk-test-secret-value");
    expect(await getOpenAIKeyForRequest()).toBe("sk-test-secret-value");
    expect(await removeOpenAIKey()).toEqual({ hasApiKey: false });
    expect((await readPublicSettings()).hasApiKey).toBe(false);
  });

  it("rejects a provider that does not have an adapter", async () => {
    useFakeChromeStorage();
    await expect(saveProviderPreferences({ provider: "gemini", model: "gemini-pro" })).rejects.toBeInstanceOf(ProviderError);
  });

  it("clears secrets and settings on full data deletion", async () => {
    const data = useFakeChromeStorage();
    await saveOpenAIKey("sk-test-secret-value");
    await saveProviderPreferences({ provider: "openai", model: "gpt-6-luna" });

    await clearAllExtensionData();
    expect(Object.keys(data)).toEqual([]);
  });
});
