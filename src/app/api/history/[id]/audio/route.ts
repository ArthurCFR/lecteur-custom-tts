import { NextRequest, NextResponse } from 'next/server';
import { readHistory, audioFilePath } from '@/lib/historyStore';
import { readFile } from 'fs/promises';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const history = await readHistory();
  const entry = history.find((e) => e.id === id);
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const buffer = await readFile(audioFilePath(entry.filename));
    const fileSize = buffer.length;
    const rangeHeader = req.headers.get('range');

    if (rangeHeader) {
      const [rawStart, rawEnd] = rangeHeader.replace('bytes=', '').split('-');
      const start = parseInt(rawStart, 10);
      const end = rawEnd ? parseInt(rawEnd, 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      return new NextResponse(buffer.slice(start, end + 1), {
        status: 206,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
        },
      });
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
        'Content-Length': String(fileSize),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
