import { NextResponse } from 'next/server';
import { readHistory, writeHistory } from '@/lib/historyStore';
import { unlink } from 'fs/promises';
import { audioFilePath } from '@/lib/historyStore';
import { getAudioDuration } from '@/lib/audioMerger';

export async function GET() {
  const history = await readHistory();

  // Lazy backfill: compute duration for entries that don't have it yet
  let dirty = false;
  for (const entry of history) {
    if (entry.duration == null) {
      const duration = await getAudioDuration(audioFilePath(entry.filename));
      if (duration !== null) {
        entry.duration = duration;
        dirty = true;
      }
    }
  }
  if (dirty) await writeHistory(history);

  return NextResponse.json(history);
}

export async function DELETE() {
  const history = await readHistory();
  for (const entry of history) {
    try { await unlink(audioFilePath(entry.filename)); } catch {}
  }
  await writeHistory([]);
  return NextResponse.json({ ok: true });
}
