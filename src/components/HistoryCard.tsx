'use client';

import { useState } from 'react';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  voice: string;
  textPreview: string;
  filename: string;
  duration?: number;
  name?: string;
  label?: string;
  category?: string;
}

export const CATEGORIES = [
  {
    id: 'travail',
    label: 'Travail',
    bg: 'bg-slate-50', border: 'border-slate-200', iconColor: 'text-slate-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V9.75a2.25 2.25 0 012.25-2.25h1.5M8.25 7.5V6a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25v1.5m-7.5 0h7.5" />
      </svg>
    ),
  },
  {
    id: 'roman',
    label: 'Roman',
    bg: 'bg-violet-50', border: 'border-violet-200', iconColor: 'text-violet-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    id: 'lecture',
    label: 'Lecture',
    bg: 'bg-teal-50', border: 'border-teal-200', iconColor: 'text-teal-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    ),
  },
  {
    id: 'apprentissage',
    label: 'Apprentissage',
    bg: 'bg-amber-50', border: 'border-amber-200', iconColor: 'text-amber-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a14.998 14.998 0 01-3 0M12 3v.75m0 0a3 3 0 013 3v.75M12 3.75a3 3 0 00-3 3v.75m3-3.75c0 0 0 0 0 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.75h4.5M12 3v.75m0 15.75V18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75A3 3 0 0112 3.75a3 3 0 013 3v.562c0 .414-.168.81-.465 1.102l-2.585 2.52V13.5h-1.9v-1.566l-2.585-2.52A1.56 1.56 0 019 8.312V6.75z" />
      </svg>
    ),
  },
  {
    id: 'articles',
    label: 'Articles',
    bg: 'bg-orange-50', border: 'border-orange-200', iconColor: 'text-orange-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 'divertissement',
    label: 'Divertissement',
    bg: 'bg-pink-50', border: 'border-pink-200', iconColor: 'text-pink-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    id: 'actualites',
    label: 'Actualités',
    bg: 'bg-sky-50', border: 'border-sky-200', iconColor: 'text-sky-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
  },
  {
    id: 'bienetre',
    label: 'Bien-être',
    bg: 'bg-emerald-50', border: 'border-emerald-200', iconColor: 'text-emerald-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
] as const;

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec === 0 ? `${m} min` : `${m}min ${sec}s`;
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

interface HistoryCardProps {
  entry: HistoryEntry;
  onPlay: (src: string, label: string) => void;
  onDownload: (url: string, filename: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<HistoryEntry>) => void;
}

export function HistoryCard({ entry, onPlay, onDownload, onDelete, onUpdate }: HistoryCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: entry.name || '', label: entry.label || entry.textPreview, category: entry.category || '' });

  const cat = CATEGORIES.find((c) => c.id === entry.category);
  const bgClass = cat ? `${cat.bg} ${cat.border}` : 'bg-white border-stone-200';

  const saveEdit = async () => {
    await fetch(`/api/history/${entry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    onUpdate(entry.id, draft);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({ name: entry.name || '', label: entry.label || entry.textPreview, category: entry.category || '' });
    setEditing(false);
  };

  const displayName = entry.name || null;
  const displayLabel = entry.label || entry.textPreview;
  const audioSrc = `/api/history/${entry.id}/audio`;
  const audioLabel = displayName || displayLabel;

  return (
    <div className={`p-4 border rounded-2xl transition-colors ${bgClass}`}>

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          {displayName ? (
            <p className="text-sm font-semibold text-stone-800 truncate">{displayName}</p>
          ) : (
            <p className="text-sm font-medium text-stone-500 italic truncate">Sans titre</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          {cat && <span className={`${cat.iconColor}`}>{cat.icon}</span>}
          <span className="text-xs text-stone-400 capitalize">{entry.voice}</span>
          {entry.duration && (
            <span className="text-xs text-stone-400">· {formatDuration(entry.duration)}</span>
          )}
          <span className="text-xs text-stone-300">· {formatRelativeTime(entry.timestamp)}</span>
          <button
            type="button"
            onClick={() => { setDraft({ name: entry.name || '', label: entry.label || entry.textPreview, category: entry.category || '' }); setEditing(true); }}
            className="text-stone-300 hover:text-stone-500 transition-colors"
            aria-label="Éditer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="text-stone-300 hover:text-stone-500 transition-colors"
            aria-label="Supprimer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Edit mode */}
      {editing ? (
        <div className="mt-2 space-y-3">
          <input
            type="text"
            placeholder="Nom du podcast…"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 text-stone-700 placeholder:text-stone-300"
          />
          <textarea
            placeholder="Description…"
            value={draft.label}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 text-stone-700 placeholder:text-stone-300 resize-none"
          />
          {/* Category picker */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, category: '' }))}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs transition-all ${
                draft.category === '' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Aucune
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, category: c.id }))}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs transition-all ${
                  draft.category === c.id
                    ? `${c.bg} ${c.border} ${c.iconColor} font-medium`
                    : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                {c.icon}
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={saveEdit}
              className="flex-1 py-2 bg-stone-800 text-white rounded-xl text-xs font-medium hover:bg-stone-700 transition-colors"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <>
          {displayLabel && (
            <p className="text-xs text-stone-400 mb-3 italic line-clamp-2">
              «&nbsp;{displayLabel}{displayLabel.length >= 100 ? '…' : ''}&nbsp;»
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPlay(audioSrc, audioLabel)}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-stone-800 text-white rounded-xl text-xs font-medium hover:bg-stone-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Écouter
            </button>
            <button
              type="button"
              onClick={() => onDownload(audioSrc, `podcast-${new Date(entry.timestamp).toISOString().slice(0, 10)}.mp3`)}
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Télécharger
            </button>
          </div>
        </>
      )}
    </div>
  );
}
