export const SCREENSHOT_HANDOFF_KEY = "cheatpet.pendingScreenshot";
export const SCREENSHOT_HANDOFF_TTL_MS = 5 * 60_000;
export const MAX_SCREENSHOT_DATA_URL_LENGTH = 5_700_000;

export interface ScreenshotHandoff {
  dataUrl: string;
  sourceTabId: number;
  windowId: number;
  captureId: string;
  capturedAt: number;
}

export interface SessionArea {
  get(key: string): Promise<Record<string, unknown>>;
  remove(key: string): Promise<void>;
}

export async function consumeScreenshotHandoff(
  area: SessionArea,
  sourceTabId: number,
  captureId: string,
  now = Date.now(),
): Promise<ScreenshotHandoff | null> {
  const stored = await area.get(SCREENSHOT_HANDOFF_KEY);
  const value = stored[SCREENSHOT_HANDOFF_KEY] as Partial<ScreenshotHandoff> | undefined;
  const matches = value?.sourceTabId === sourceTabId && value.captureId === captureId;
  const fresh = typeof value?.capturedAt === "number" && now >= value.capturedAt && now - value.capturedAt < SCREENSHOT_HANDOFF_TTL_MS;
  const valid = typeof value?.dataUrl === "string" && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value.dataUrl) && value.dataUrl.length <= MAX_SCREENSHOT_DATA_URL_LENGTH && Number.isInteger(value.windowId);
  if (matches) {
    await area.remove(SCREENSHOT_HANDOFF_KEY);
    return fresh && valid ? value as ScreenshotHandoff : null;
  }
  if (typeof value?.capturedAt === "number" && !fresh) await area.remove(SCREENSHOT_HANDOFF_KEY);
  return null;
}
