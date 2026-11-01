import type { PracticeRecord } from "./types";

export const HISTORY_STORAGE_KEY = "cheatpet.history.v1";
export const MAX_HISTORY_RECORDS = 100;

async function readRecords(): Promise<PracticeRecord[]> {
  const stored = await chrome.storage.local.get(HISTORY_STORAGE_KEY);
  const records = stored[HISTORY_STORAGE_KEY];
  return Array.isArray(records) ? (records as PracticeRecord[]) : [];
}

async function writeRecords(records: PracticeRecord[]): Promise<void> {
  await chrome.storage.local.set({
    [HISTORY_STORAGE_KEY]: records.slice(0, MAX_HISTORY_RECORDS),
  });
}

export async function listHistory(): Promise<PracticeRecord[]> {
  return (await readRecords()).sort((a, b) => b.createdAt - a.createdAt);
}

export async function savePracticeRecord(record: PracticeRecord): Promise<void> {
  const records = await readRecords();
  await writeRecords([record, ...records.filter((item) => item.id !== record.id)]);
}

export async function toggleSavedRecord(id: string): Promise<PracticeRecord | undefined> {
  const records = await readRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) return undefined;

  const updated = { ...records[index]!, saved: !records[index]!.saved };
  records[index] = updated;
  await writeRecords(records);
  return updated;
}

export async function deletePracticeRecord(id: string): Promise<void> {
  const records = await readRecords();
  await writeRecords(records.filter((record) => record.id !== id));
}

export async function clearPracticeHistory(): Promise<void> {
  await chrome.storage.local.remove(HISTORY_STORAGE_KEY);
}
