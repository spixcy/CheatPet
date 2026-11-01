import { describe, expect, it } from "vitest";
import { consumeScreenshotHandoff, SCREENSHOT_HANDOFF_KEY, type ScreenshotHandoff } from "../src/shared/screenshotHandoff";

const makeArea = (handoff?: ScreenshotHandoff) => {
  const values: Record<string, unknown> = handoff ? { [SCREENSHOT_HANDOFF_KEY]: handoff } : {};
  return {
    values,
    async get(key: string) { return { [key]: values[key] }; },
    async remove(key: string) { delete values[key]; },
  };
};
const handoff: ScreenshotHandoff = {
  dataUrl: "data:image/jpeg;base64,aGVsbG8=", sourceTabId: 12, windowId: 3,
  captureId: "capture-1", capturedAt: 10_000,
};

describe("one-time screenshot handoff", () => {
  it("consumes a fresh matching capture once", async () => {
    const area = makeArea(handoff);
    expect(await consumeScreenshotHandoff(area, 12, "capture-1", 11_000)).toEqual(handoff);
    expect(area.values[SCREENSHOT_HANDOFF_KEY]).toBeUndefined();
    expect(await consumeScreenshotHandoff(area, 12, "capture-1", 11_000)).toBeNull();
  });

  it("rejects mismatched IDs without consuming another capture", async () => {
    const area = makeArea(handoff);
    expect(await consumeScreenshotHandoff(area, 99, "capture-1", 11_000)).toBeNull();
    expect(area.values[SCREENSHOT_HANDOFF_KEY]).toEqual(handoff);
    expect(await consumeScreenshotHandoff(area, 12, "wrong", 11_000)).toBeNull();
  });

  it("removes expired and invalid image payloads", async () => {
    const expired = makeArea(handoff);
    expect(await consumeScreenshotHandoff(expired, 12, "capture-1", 310_000)).toBeNull();
    expect(expired.values[SCREENSHOT_HANDOFF_KEY]).toBeUndefined();
    const invalid = makeArea({ ...handoff, dataUrl: "data:image/png;base64,abc" });
    expect(await consumeScreenshotHandoff(invalid, 12, "capture-1", 11_000)).toBeNull();
    expect(invalid.values[SCREENSHOT_HANDOFF_KEY]).toBeUndefined();
  });
});
