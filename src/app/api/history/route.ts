import { NextResponse } from 'next/server';
import { readHistory, writeHistory } from '@/lib/historyStore';
import { unlink } from 'fs/promises';
import { audioFilePath } from '@/lib/historyStore';

export async function GET() {
  const history = await readHistory();
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
