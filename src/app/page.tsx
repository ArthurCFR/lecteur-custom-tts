'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioPlayer } from '@/components/AudioPlayer';

const VOICES = [
  { id: 'alloy', label: 'Alloy', desc: 'Neutre et clair' },
  { id: 'nova', label: 'Nova', desc: 'Chaleureux, féminin' },
  { id: 'sage', label: 'Sage', desc: 'Posé, narrateur' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Doux, expressif' },
];

const ACCEPTED_TYPES = ['.txt', '.md', '.html', '.htm'];

interface HistoryEntry {
  id: string;
  timestamp: number;
  voice: string;
  textPreview: string;
  filename: string;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days}j`;
}

export default function Home() {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [voice, setVoice] = useState('alloy');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeAudio, setActiveAudio] = useState<{ src: string; label: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) setHistory(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading]);

  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  const handleFileSelect = useCallback((f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['txt', 'md', 'html', 'htm'].includes(ext)) {
      setError('Format non supporté. Utilisez .txt, .md ou .html');
      return;
    }
    setFile(f);
    setText('');
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const deleteHistoryEntry = async (id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/history/${id}`, { method: 'DELETE' });
  };

  const clearHistory = async () => {
    setHistory([]);
    await fetch('/api/history', { method: 'DELETE' });
  };

  const handleImportMp3 = async (f: File) => {
    const formData = new FormData();
    formData.append('file', f);
    formData.append('label', f.name.replace(/\.mp3$/i, ''));
    const res = await fetch('/api/history/upload', { method: 'POST', body: formData });
    if (res.ok) await fetchHistory();
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  const handleGenerate = async () => {
    if (!text.trim() && !file) {
      setError('Veuillez saisir du texte ou déposer un fichier.');
      return;
    }

    setLoading(true);
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formData = new FormData();
    if (file) formData.append('file', file);
    else formData.append('text', text);
    formData.append('voice', voice);

    try {
      const res = await fetch(`/api/tts?voice=${encodeURIComponent(voice)}`, { method: 'POST', body: formData, signal: controller.signal });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erreur serveur.' }));
        throw new Error(data.error || 'Erreur lors de la génération.');
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
      await fetchHistory();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Génération annulée.');
      } else {
        setError(err instanceof Error ? err.message : 'Erreur inconnue.');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleDownload = (url: string, filename = 'podcast.mp3') => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const charCount = file ? null : text.length;
  const hasInput = text.trim().length > 0 || file !== null;

  return (
    <main className={`min-h-screen bg-stone-50 flex items-start justify-center px-4 py-16 ${activeAudio ? 'pb-36' : ''}`}>
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">
            <span className="w-4 h-px bg-stone-300" />
            TTS Studio
          </div>
          <h1 className="text-4xl font-light text-stone-800 tracking-tight leading-tight">
            Texte vers<br />
            <span className="font-semibold">Podcast</span>
          </h1>
          <p className="mt-3 text-stone-400 text-sm">
            Collez du texte ou déposez un fichier — obtenez un MP3 prêt à écouter.
          </p>
        </div>

        {/* Text input */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">
            Texte
          </label>
          <textarea
            className="w-full h-44 px-4 py-3 border border-stone-200 rounded-xl resize-none text-stone-700 text-sm placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 bg-white transition-shadow"
            placeholder="Collez votre texte ici…"
            value={text}
            onChange={(e) => { setText(e.target.value); setFile(null); setError(null); }}
            disabled={loading}
          />
          {charCount !== null && charCount > 0 && (
            <p className="text-right text-xs text-stone-400 mt-1">
              {charCount.toLocaleString('fr-FR')} caractères
              {charCount > 4000 && (
                <span className="text-amber-500 ml-2">
                  · sera découpé en {Math.ceil(charCount / 4000)} segments
                </span>
              )}
            </p>
          )}
        </div>

        {/* Separator */}
        <div className="flex items-center gap-3 my-4">
          <span className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400 font-medium">ou</span>
          <span className="flex-1 h-px bg-stone-200" />
        </div>

        {/* File drop zone */}
        <div className="mb-8">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">
            Fichier
          </label>
          <div
            role="button"
            tabIndex={0}
            aria-label="Zone de dépôt de fichier"
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none
              ${dragOver ? 'border-stone-400 bg-stone-100 scale-[1.01]' : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'}
              ${file ? 'border-emerald-300 bg-emerald-50/60' : ''}
              ${loading ? 'opacity-60 pointer-events-none' : ''}
            `}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3 text-emerald-700">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-stone-400">({(file.size / 1024).toFixed(1)} Ko)</span>
                <button
                  type="button"
                  className="ml-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }}
                  aria-label="Retirer le fichier"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="text-stone-400">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm">
                  Déposez un fichier <span className="font-medium text-stone-600">.txt, .md, .html</span>
                </p>
                <p className="text-xs mt-1 text-stone-300">ou cliquez pour parcourir</p>
              </div>
            )}
          </div>
        </div>

        {/* Voice selector */}
        <div className="mb-8">
          <label className="block text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Voix
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VOICES.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={loading}
                onClick={() => setVoice(v.id)}
                className={`px-4 py-3 rounded-xl text-left transition-all border
                  ${voice === v.id
                    ? 'bg-stone-800 text-white border-stone-800 shadow-md'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:shadow-sm'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="text-sm font-medium">{v.label}</div>
                <div className="text-xs mt-0.5 text-stone-400">{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate + Stop */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !hasInput}
            className="flex-1 py-4 bg-stone-800 text-white rounded-xl font-medium tracking-wide hover:bg-stone-700 active:bg-stone-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>
                  Génération en cours…
                  {elapsed > 0 && <span className="font-normal opacity-70 ml-2">{elapsed}s</span>}
                </span>
              </span>
            ) : (
              'Générer le podcast'
            )}
          </button>

          {loading && (
            <button
              type="button"
              onClick={handleStop}
              title="Arrêter la génération"
              className="px-5 py-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-500 active:bg-red-700 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          )}
        </div>

        {loading && (
          <p className="text-center text-xs text-stone-400 mt-3">
            La génération prend généralement 20 à 40 secondes selon la longueur du texte.
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Current audio */}
        {audioUrl && (
          <div className="mt-6 p-6 bg-white border border-stone-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-stone-500 uppercase tracking-widest">
                Podcast généré
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveAudio({ src: audioUrl, label: file ? file.name : text.slice(0, 80) })}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Écouter
              </button>
              <button
                type="button"
                onClick={() => handleDownload(audioUrl)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Télécharger
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-stone-400 uppercase tracking-widest">
                <span className="w-4 h-px bg-stone-300" />
                Historique ({history.length})
              </div>
              <div className="flex items-center gap-3">
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".mp3"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportMp3(f); e.target.value = ''; }}
                />
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Importer un MP3
                </button>
                <span className="w-px h-3 bg-stone-200" />
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Tout effacer
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="p-4 bg-white border border-stone-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-stone-600 capitalize">{entry.voice}</span>
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                      <span className="text-xs text-stone-400">{formatRelativeTime(entry.timestamp)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteHistoryEntry(entry.id)}
                      className="text-xs text-stone-300 hover:text-stone-500 transition-colors"
                      aria-label="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                  {entry.textPreview && (
                    <p className="text-xs text-stone-400 mb-3 italic line-clamp-2">
                      «&nbsp;{entry.textPreview}{entry.textPreview.length >= 100 ? '…' : ''}&nbsp;»
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveAudio({ src: `/api/history/${entry.id}/audio`, label: entry.textPreview || entry.voice })}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-stone-800 text-white rounded-xl text-xs font-medium hover:bg-stone-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Écouter
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(
                        `/api/history/${entry.id}/audio`,
                        `podcast-${new Date(entry.timestamp).toISOString().slice(0, 10)}.mp3`
                      )}
                      className="flex-1 flex items-center justify-center gap-2 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs font-medium hover:bg-stone-50 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-stone-300 mt-10">
          Propulsé par OpenAI TTS · Contenu traité côté serveur
        </p>

      </div>

      {activeAudio && (
        <AudioPlayer
          src={activeAudio.src}
          label={activeAudio.label}
          onClose={() => setActiveAudio(null)}
        />
      )}

    </main>
  );
}
