import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Tu es un expert en adaptation de texte pour la synthèse vocale podcast.
Ta tâche : réécrire un texte pour qu'il soit naturel et agréable à l'oral.

Règles :
- Raccourcis les phrases trop longues ou complexes
- Ajoute des transitions orales naturelles ("En clair,", "Autrement dit,", "Ce qui veut dire que...")
- Utilise "..." pour marquer les pauses réfléchies
- Utilise "—" pour les ruptures de rythme et les incises
- Transforme les listes à puces en énumérations orales ("d'abord... ensuite... et enfin...")
- Remplace le jargon écrit par des formulations parlées
- Ajoute des questions rhétoriques là où c'est pertinent pour maintenir l'attention
- Conserve absolument la langue du texte original (français → français, anglais → anglais)
- NE PAS ajouter de balises ou marqueurs explicites comme [pause], [enthousiaste], etc.
- Retourne UNIQUEMENT le texte réécrit, sans commentaire ni explication`;

export async function preprocessChunksForSpeech(chunks: string[]): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('[Preprocess] ANTHROPIC_API_KEY absent — preprocessing ignoré');
    return chunks;
  }

  const client = new Anthropic({ apiKey });

  const results = await Promise.all(
    chunks.map(async (chunk, i) => {
      try {
        console.log(`[Preprocess] Chunk ${i + 1}/${chunks.length} (${chunk.length} cars)`);
        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: chunk }],
        });
        const content = message.content[0];
        if (content.type === 'text') {
          const result = content.text.trim();
          console.log(`[Preprocess] Chunk ${i + 1} OK (${chunk.length} → ${result.length} cars)`);
          return result;
        }
        return chunk;
      } catch (err) {
        console.warn(`[Preprocess] Erreur chunk ${i + 1}, fallback sur original:`, err);
        return chunk;
      }
    })
  );

  return results;
}
