import { afterEach, describe, expect, it, vi } from "vitest";
import { clearPracticeHistory, deletePracticeRecord, listHistory, savePracticeRecord, toggleSavedRecord } from "../src/shared/localHistory";
import type { PracticeRecord } from "../src/shared/types";

const record = (id: string, createdAt: number, saved = false): PracticeRecord => ({
  id,
  createdAt,
  question: `Question ${id}`,
  options: [],
  source: "manual",
  provider: "openai",
  model: "gpt-6-luna",
  answerSummary: "Study answer",
  recommendedLabels: [],
  explanation: "Reasoning",
  steps: [],
  confidence: "medium",
  confidenceReason: "Some uncertainty remains.",
  caveats: [],
  saved,
});

function useFakeChromeStorage(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const local = {
    get: async (key: string) => ({ [key]: data[key] }),
    set: async (values: Record<string, unknown>) => Object.assign(data, values),
    remove: async (key: string) => { delete data[key]; },
  };
  vi.stubGlobal("chrome", { storage: { local } });
  return data;
}

afterEach(() => vi.unstubAllGlobals());

describe("local practice history", () => {
  it("keeps newest items first and persists saved state", async () => {
    useFakeChromeStorage();
    await savePracticeRecord(record("older", 1));
    await savePracticeRecord(record("newer", 2));

    expect((await listHistory()).map((item) => item.id)).toEqual(["newer", "older"]);
    await toggleSavedRecord("older");
    expect((await listHistory())[1]?.saved).toBe(true);
  });

  it("deletes a record and clears the local history key", async () => {
    const data = useFakeChromeStorage();
    await savePracticeRecord(record("one", 1));
    await savePracticeRecord(record("two", 2));
    await deletePracticeRecord("one");
    expect((await listHistory()).map((item) => item.id)).toEqual(["two"]);

    await clearPracticeHistory();
    expect(await listHistory()).toEqual([]);
    expect(Object.keys(data)).toHaveLength(0);
  });
});
