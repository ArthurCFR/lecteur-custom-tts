import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import path from 'path';
import { cleanMarkdown, cleanHtml, splitIntoChunks } from '@/lib/textCleaner';
import { mergeAudioBuffers } from '@/lib/audioMerger';
import { ensureStorageDir, addEntry, STORAGE_DIR } from '@/lib/historyStore';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const textInput = formData.get('text') as string | null;
    const fileInput = formData.get('file') as File | null;
    const voice = (formData.get('voice') as string) || process.env.TTS_VOICE || 'alloy';

    if (!textInput && !fileInput) {
      return NextResponse.json({ error: 'Aucun texte fourni.' }, { status: 400 });
    }

    let rawText = '';
    let ext = 'txt';

    if (fileInput) {
      rawText = await fileInput.text();
      const name = fileInput.name.toLowerCase();
      if (name.endsWith('.md')) ext = 'md';
      else if (name.endsWith('.html') || name.endsWith('.htm')) ext = 'html';
    } else {
      rawText = textInput!;
    }

    let cleanedText: string;
    if (ext === 'md') cleanedText = cleanMarkdown(rawText);
    else if (ext === 'html') cleanedText = cleanHtml(rawText);
    else cleanedText = rawText;

    cleanedText = cleanedText.trim();
    if (!cleanedText) {
      return NextResponse.json(
        { error: 'Le texte est vide après nettoyage.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.TTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API TTS manquante. Définissez la variable TTS_API_KEY.' },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: process.env.TTS_BASE_URL || 'https://api.openai.com/v1',
    });

    const model = process.env.TTS_MODEL || 'gpt-4o-mini-tts';
    const chunks = splitIntoChunks(cleanedText);

    console.log(`[TTS] ${chunks.length} segment(s) · voix: ${voice} · modèle: ${model}`);

    const buffers: Buffer[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`[TTS] Segment ${i + 1}/${chunks.length} (${chunks[i].length} cars)`);

      const params: Record<string, unknown> = {
        model,
        voice,
        input: chunks[i],
        response_format: 'mp3',
      };

      if (model.includes('gpt-4o')) {
        params.instructions =
          'Lis ce texte comme un narrateur de podcast français, calme, clair et posé.';
      }

      const response = await client.audio.speech.create(
        params as unknown as Parameters<typeof client.audio.speech.create>[0],
        { signal: req.signal }
      );

      buffers.push(Buffer.from(await response.arrayBuffer()));
    }

    const merged = buffers.length === 1 ? buffers[0] : await mergeAudioBuffers(buffers);

    // Save to persistent storage
    const id = randomUUID();
    const filename = `${id}.mp3`;
    await ensureStorageDir();
    await writeFile(path.join(STORAGE_DIR, filename), merged);
    await addEntry({
      id,
      timestamp: Date.now(),
      voice,
      textPreview: cleanedText.slice(0, 100).trim(),
      filename,
    });

    return new NextResponse(new Uint8Array(merged), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="podcast.mp3"',
        'Content-Length': String(merged.length),
        'X-History-Id': id,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue.';
    console.error('[TTS] Erreur:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
