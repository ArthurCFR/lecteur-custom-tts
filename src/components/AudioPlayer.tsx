'use client';

import { useEffect, useRef, useState } from 'react';

const SPEEDS = [1, 1.2, 1.5, 2, 3];

interface AudioPlayerProps {
  src: string;
  label?: string;
  onClose: () => void;
}

function formatTime(s: number) {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ src, label, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);

  const speed = SPEEDS[speedIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  };

  const cycleSpeed = () => setSpeedIndex((i) => (i + 1) % SPEEDS.length);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 text-white shadow-2xl border-t border-stone-800">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="max-w-2xl mx-auto px-4 pt-3 pb-4">

        {/* Label + close */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-stone-400 truncate max-w-sm italic">
            {label ? `« ${label} »` : 'Podcast'}
          </p>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-300 transition-colors ml-4 shrink-0"
            aria-label="Fermer le lecteur"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.5}
            value={currentTime}
            onChange={(e) => {
              const t = Number(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = t;
              setCurrentTime(t);
            }}
            className="w-full h-1 rounded-full appearance-none cursor-pointer accent-white bg-stone-700"
          />
          <div className="flex justify-between text-xs text-stone-600 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">

          {/* -15s */}
          <button
            onClick={() => skip(-15)}
            className="flex flex-col items-center gap-0.5 text-stone-400 hover:text-white transition-colors"
            aria-label="Reculer 15 secondes"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            <span className="text-xs leading-none">15</span>
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-white text-stone-900 flex items-center justify-center hover:bg-stone-200 active:bg-stone-300 transition-colors shadow-md"
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* +30s */}
          <button
            onClick={() => skip(30)}
            className="flex flex-col items-center gap-0.5 text-stone-400 hover:text-white transition-colors"
            aria-label="Avancer 30 secondes"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
            <span className="text-xs leading-none">30</span>
          </button>

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            className="w-10 h-7 rounded-md border border-stone-700 text-xs font-medium text-stone-400 hover:text-white hover:border-stone-500 transition-colors"
            aria-label="Changer la vitesse"
          >
            {speed === 1 ? '1×' : `${speed}×`}
          </button>

        </div>
      </div>
    </div>
  );
}
