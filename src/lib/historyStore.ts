import { mkdir, readFile, writeFile, unlink } from 'fs/promises';
import path from 'path';

export const STORAGE_DIR = process.env.STORAGE_DIR ?? path.join(process.cwd(), '.storage');
const HISTORY_FILE = path.join(STORAGE_DIR, 'history.json');
const MAX_HISTORY = 20;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  voice: string;
  textPreview: string;
  filename: string;
  duration?: number;
  name?: string;
  label?: string;
  category?: string;
}

export async function ensureStorageDir() {
  await mkdir(STORAGE_DIR, { recursive: true });
}

export async function readHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await readFile(HISTORY_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeHistory(entries: HistoryEntry[]) {
  await ensureStorageDir();
  await writeFile(HISTORY_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

export async function addEntry(entry: HistoryEntry): Promise<HistoryEntry[]> {
  const history = await readHistory();
  const next = [entry, ...history].slice(0, MAX_HISTORY);
  await writeHistory(next);
  return next;
}

export async function updateEntry(id: string, updates: Partial<Pick<HistoryEntry, 'name' | 'label' | 'category'>>) {
  const history = await readHistory();
  const idx = history.findIndex((e) => e.id === id);
  if (idx === -1) return;
  history[idx] = { ...history[idx], ...updates };
  await writeHistory(history);
}

export async function deleteEntry(id: string) {
  const history = await readHistory();
  const entry = history.find((e) => e.id === id);
  await writeHistory(history.filter((e) => e.id !== id));
  if (entry) {
    try { await unlink(path.join(STORAGE_DIR, entry.filename)); } catch {}
  }
}

export function audioFilePath(filename: string) {
  return path.join(STORAGE_DIR, filename);
}
