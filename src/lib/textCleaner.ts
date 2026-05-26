export function cleanMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)([^*_]+?)\1/g, '$2')
    .replace(/(\*|_)([^*_]+?)\1/g, '$2')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .replace(/\|[^\n]+\|/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function splitIntoChunks(text: string, maxChars = 4000): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > maxChars) {
    let splitAt = -1;

    const endings = ['\n\n', '.\n', '? ', '! ', '. '];
    for (const ending of endings) {
      const idx = remaining.lastIndexOf(ending, maxChars);
      if (idx > splitAt) splitAt = idx + ending.length;
    }

    if (splitAt <= 0) {
      splitAt = remaining.lastIndexOf(' ', maxChars);
    }

    if (splitAt <= 0) splitAt = maxChars;

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}
