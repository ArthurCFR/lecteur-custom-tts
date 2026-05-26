import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { ensureStorageDir, addEntry, STORAGE_DIR } from '@/lib/historyStore';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const voice = (formData.get('voice') as string) || 'import';
    const label = (formData.get('label') as string) || file?.name || 'fichier importé';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith('.mp3')) {
      return NextResponse.json({ error: 'Seuls les fichiers .mp3 sont acceptés.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = randomUUID();
    const filename = `${id}.mp3`;

    await ensureStorageDir();
    await writeFile(path.join(STORAGE_DIR, filename), buffer);
    await addEntry({
      id,
      timestamp: Date.now(),
      voice,
      textPreview: label,
      filename,
    });

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
