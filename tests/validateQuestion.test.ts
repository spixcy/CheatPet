import { describe, expect, it } from "vitest";
import { approximateImageBytes, validateQuestionDraft } from "../src/shared/validateQuestion";
import type { QuestionDraft } from "../src/shared/types";

const draft = (overrides: Partial<QuestionDraft> = {}): QuestionDraft => ({
  question: "What is 2 + 2?",
  options: [],
  source: "manual",
  ...overrides,
});

describe("validateQuestionDraft", () => {
  it("requires text or an image", () => {
    expect(validateQuestionDraft(draft({ question: "  " }))).toContain("Add a question");
  });

  it("allows an image-only question with a supported image type", () => {
    expect(
      validateQuestionDraft(draft({ question: "", source: "image", imageDataUrl: "data:image/png;base64,aGVsbG8=" })),
    ).toBeNull();
  });

  it("rejects one incomplete choice and duplicate labels", () => {
    expect(validateQuestionDraft(draft({ options: [{ id: "1", label: "A", text: "Only one" }] }))).toContain("at least two");
    expect(
      validateQuestionDraft(
        draft({
          options: [
            { id: "1", label: "A", text: "First" },
            { id: "2", label: "a", text: "Second" },
          ],
        }),
      ),
    ).toContain("used more than once");
  });

  it("rejects unsupported images", () => {
    expect(validateQuestionDraft(draft({ imageDataUrl: "data:image/svg+xml;base64,PHN2Zz4=" }))).toContain("PNG, JPEG, or WebP");
  });

  it("estimates the binary size represented by base64", () => {
    expect(approximateImageBytes("data:image/png;base64,aGVsbG8=")).toBe(5);
  });
});
