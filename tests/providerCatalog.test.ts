import { describe, expect, it } from "vitest";
import { isProviderReady, providerCatalog } from "../src/shared/providers/catalog";

describe("provider catalog", () => {
  it("marks OpenAI as the only initially ready provider", () => {
    expect(providerCatalog.filter((provider) => provider.status === "ready").map((provider) => provider.id)).toEqual([
      "openai",
    ]);
    expect(isProviderReady("openai")).toBe(true);
  });

  it("keeps future providers visible without enabling them", () => {
    expect(isProviderReady("gemini")).toBe(false);
    expect(isProviderReady("anthropic")).toBe(false);
    expect(isProviderReady("openrouter")).toBe(false);
    expect(isProviderReady("ollama")).toBe(false);
  });
});
