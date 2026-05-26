import { NextResponse } from 'next/server';
import { readHistory, audioFilePath } from '@/lib/historyStore';
import { readFile } from 'fs/promises';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const history = await readHistory();
  const entry = history.find((e) => e.id === id);
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const buffer = await readFile(audioFilePath(entry.filename));
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
