# Texte vers Podcast

Convertissez du texte (collé ou fichier .txt/.md/.html) en fichier audio MP3 via un moteur TTS.

## Variables d'environnement

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `TTS_API_KEY` | ✅ | — | Clé API du provider TTS |
| `TTS_BASE_URL` | — | `https://api.openai.com/v1` | URL de base de l'API |
| `TTS_MODEL` | — | `gpt-4o-mini-tts` | Modèle TTS |
| `TTS_VOICE` | — | `alloy` | Voix par défaut |

## Lancement local

```bash
cp .env.example .env.local
# Éditez .env.local et renseignez TTS_API_KEY

npm install
npm run dev
# Ouvrez http://localhost:3000
```

## Déploiement (Coolify)

1. Poussez le repo sur GitHub.
2. Dans Coolify : **New Resource → Public Repository → Nixpacks**.
3. Injectez les 4 variables `TTS_*` dans l'onglet **Environment Variables**.
4. Port d'écoute : **3000** (configuré dans `npm start`).
5. Aucune dépendance système requise — `ffmpeg-static` embarque son propre binaire.
