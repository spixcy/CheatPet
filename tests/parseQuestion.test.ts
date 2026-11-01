import { describe, expect, it } from "vitest";
import { parseQuestionInput } from "../src/shared/parseQuestion";

describe("parseQuestionInput", () => {
  it("keeps a plain question intact when no choices are present", () => {
    const result = parseQuestionInput("What is the largest planet?");

    expect(result).toEqual({
      question: "What is the largest planet?",
      options: [],
    });
  });

  it("splits lettered choices from a question", () => {
    const result = parseQuestionInput(
      "Which planet is largest?\nA. Earth\nB. Jupiter\nC. Mars",
    );

    expect(result.question).toBe("Which planet is largest?");
    expect(result.options.map(({ label, text }) => [label, text])).toEqual([
      ["A", "Earth"],
      ["B", "Jupiter"],
      ["C", "Mars"],
    ]);
  });

  it("accepts parenthesized and numbered options", () => {
    const letters = parseQuestionInput("Pick one\n(A) First\n(B) Second");
    const numbers = parseQuestionInput("Pick one\n1) First\n2) Second");

    expect(letters.options.map((option) => option.label)).toEqual(["A", "B"]);
    expect(numbers.options.map((option) => option.label)).toEqual(["1", "2"]);
  });

  it("joins wrapped option text and normalizes Windows line endings", () => {
    const result = parseQuestionInput("Choose\r\nA) First line\r\ncontinued\r\nB) Other");

    expect(result.options[0]?.text).toBe("First line continued");
    expect(result.options[1]?.text).toBe("Other");
  });

  it("does not split a lone option marker from ordinary text", () => {
    const raw = "Question text\nA. only one option";

    expect(parseQuestionInput(raw)).toEqual({ question: raw, options: [] });
  });
});
