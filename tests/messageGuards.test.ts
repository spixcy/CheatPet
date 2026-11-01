import { describe, expect, it } from "vitest";
import { isRuntimeRequest, isTrustedExtensionPage } from "../src/background/messageGuards";

const extensionId = "abcdefghijklmnopabcdefghijklmnop";

describe("extension message boundaries", () => {
  it("allows only known pages from the current extension", () => {
    expect(
      isTrustedExtensionPage(
        { id: extensionId, url: `chrome-extension://${extensionId}/options.html` },
        extensionId,
      ),
    ).toBe(true);
    expect(isTrustedExtensionPage({ id: extensionId, url: "https://example.com/index.html" }, extensionId)).toBe(false);
    expect(
      isTrustedExtensionPage(
        { id: "different-extension", url: `chrome-extension://${extensionId}/options.html` },
        extensionId,
      ),
    ).toBe(false);
    expect(
      isTrustedExtensionPage(
        { id: extensionId, url: `chrome-extension://${extensionId}/content-script.html` },
        extensionId,
      ),
    ).toBe(false);
  });

  it("accepts OpenAI settings and rejects unimplemented providers", () => {
    expect(isRuntimeRequest({ type: "SAVE_PROVIDER_SETTINGS", provider: "openai", model: "gpt-6-luna" })).toBe(true);
    expect(isRuntimeRequest({ type: "SAVE_PROVIDER_SETTINGS", provider: "gemini", model: "gemini-pro" })).toBe(false);
    expect(isRuntimeRequest({ type: "GET_PUBLIC_SETTINGS", unexpectedSecret: "ignored" })).toBe(false);
    expect(isRuntimeRequest({ type: "REMOVE_API_KEY", apiKey: "must-not-be-sent" })).toBe(false);
  });

  it("validates question content before accepting generation requests", () => {
    expect(
      isRuntimeRequest({
        type: "GENERATE_ANSWER",
        draft: { question: "Study question", options: [], source: "manual" },
      }),
    ).toBe(true);
    expect(
      isRuntimeRequest({
        type: "GENERATE_ANSWER",
        draft: { question: "", options: [], source: "manual" },
      }),
    ).toBe(false);
    expect(isRuntimeRequest({ type: "DELETE_SOMETHING_ELSE" })).toBe(false);
  });
});
