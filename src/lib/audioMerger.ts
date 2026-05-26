import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { writeFile, readFile, mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

ffmpeg.setFfmpegPath(ffmpegPath as string);

export async function getAudioDuration(filePath: string): Promise<number | null> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ffmpeg as any).ffprobe(filePath, (err: unknown, meta: { format?: { duration?: number } }) => {
      if (err || !meta?.format?.duration) { resolve(null); return; }
      resolve(Math.round(meta.format.duration));
    });
  });
}

export async function mergeAudioBuffers(buffers: Buffer[]): Promise<Buffer> {
  if (buffers.length === 1) return buffers[0];

  const tempDir = join(tmpdir(), `tts-${randomUUID()}`);
  await mkdir(tempDir, { recursive: true });

  try {
    const inputFiles: string[] = [];

    for (let i = 0; i < buffers.length; i++) {
      const p = join(tempDir, `chunk-${i}.mp3`);
      await writeFile(p, buffers[i]);
      inputFiles.push(p);
    }

    const concatListPath = join(tempDir, 'list.txt');
    const concatContent = inputFiles.map((f) => `file '${f}'`).join('\n');
    await writeFile(concatListPath, concatContent, 'utf8');

    const outputPath = join(tempDir, 'output.mp3');

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(concatListPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c', 'copy'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .run();
    });

    return await readFile(outputPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
