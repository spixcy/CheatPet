import { describe, expect, it, vi } from "vitest";
import { buildOpenAIRequestBody, openAIProvider, OPENAI_RESPONSES_URL } from "../src/shared/providers/openai";
import { ProviderError } from "../src/shared/providers/provider";
import type { QuestionDraft } from "../src/shared/types";

const draft: QuestionDraft = {
  question: "Which planet is largest?",
  options: [
    { id: "1", label: "A", text: "Earth" },
    { id: "2", label: "B", text: "Jupiter" },
  ],
  source: "manual",
};

const answer = {
  answerSummary: "Jupiter is the largest planet.",
  recommendedLabels: ["B"],
  explanation: "Jupiter has the greatest diameter and mass of the planets in our solar system.",
  steps: ["Compare the planets by size.", "Jupiter is the largest."],
  confidence: "high",
  confidenceReason: "This is a well-established fact.",
  caveats: [],
};

describe("OpenAI Responses adapter", () => {
  it("builds a no-storage structured request with the study prompt", () => {
    const body = buildOpenAIRequestBody(draft, "custom-model") as {
      store: boolean;
      model: string;
      input: Array<{ content: Array<{ type: string; text?: string }> }>;
      text: { format: { type: string; strict: boolean; schema: { additionalProperties: boolean } } };
    };

    expect(body.store).toBe(false);
    expect(body.model).toBe("custom-model");
    expect(body.input[0]?.content[0]?.text).toContain("B) Jupiter");
    expect(body.text.format).toMatchObject({ type: "json_schema", strict: true });
    expect(body.text.format.schema.additionalProperties).toBe(false);
  });

  it("includes a user-provided image as an input_image part", () => {
    const body = buildOpenAIRequestBody(
      { ...draft, imageDataUrl: "data:image/png;base64,aGVsbG8=" },
      "gpt-6-luna",
    ) as { input: Array<{ content: Array<{ type: string; image_url?: string }> }> };

    expect(body.input[0]?.content[1]).toEqual({
      type: "input_image",
      image_url: "data:image/png;base64,aGVsbG8=",
    });
  });

  it("sends the request directly and parses the structured answer", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(answer) }] }],
        }),
        { status: 200 },
      ),
    );

    const result = await openAIProvider.generateAnswer({
      draft,
      model: "gpt-6-luna",
      apiKey: "test-key",
      fetcher: fetcher as typeof fetch,
    });

    expect(fetcher).toHaveBeenCalledWith(
      OPENAI_RESPONSES_URL,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
      }),
    );
    expect(result.recommendedLabels).toEqual(["B"]);
    expect(result.steps).toHaveLength(2);
  });

  it("maps an invalid key response to a user-facing provider error", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("{}", { status: 401 }));

    await expect(
      openAIProvider.generateAnswer({ draft, model: "gpt-6-luna", apiKey: "bad-key", fetcher: fetcher as typeof fetch }),
    ).rejects.toMatchObject({ code: "unauthorized" });
  });

  it("rejects malformed structured answers", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ output: [{ type: "message", content: [{ type: "output_text", text: "not-json" }] }] }), {
        status: 200,
      }),
    );

    await expect(
      openAIProvider.generateAnswer({ draft, model: "gpt-6-luna", apiKey: "test-key", fetcher: fetcher as typeof fetch }),
    ).rejects.toBeInstanceOf(ProviderError);
  });
});
