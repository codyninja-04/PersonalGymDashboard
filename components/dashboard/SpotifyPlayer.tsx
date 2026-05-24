"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Headphones, Edit3, Check, X } from "lucide-react";

interface Preset {
  label: string;
  vibe: string;
  url: string;
}

// Public Spotify playlists — embed-friendly, no auth required.
// These are official Spotify-curated lists (very stable IDs).
const PRESETS: Preset[] = [
  {
    label: "Laid Mode",
    vibe: "Phonk · the David Laid staple.",
    url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX1tyCD9QhIWF?utm_source=generator&theme=0",
  },
  {
    label: "Beast Mode",
    vibe: "Heavy compound days.",
    url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator&theme=0",
  },
  {
    label: "Sculpt Mix",
    vibe: "Rap × hardstyle · push days.",
    url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWUVpAXiEPK8P?utm_source=generator&theme=0",
  },
  {
    label: "Cardio Lock-in",
    vibe: "Steady state · 45-min cap.",
    url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWSJHnPb1f0X3?utm_source=generator&theme=0",
  },
];

const STORAGE_KEY = "anand-spotify-playlist";

function normalizeSpotifyUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Already embed URL
  if (trimmed.includes("open.spotify.com/embed/")) return trimmed;
  // Convert open.spotify.com/playlist/ID → embed
  const playlistMatch = trimmed.match(/open\.spotify\.com\/playlist\/([A-Za-z0-9]+)/);
  if (playlistMatch) {
    return `https://open.spotify.com/embed/playlist/${playlistMatch[1]}?utm_source=generator&theme=0`;
  }
  // spotify:playlist:ID URI form
  const uriMatch = trimmed.match(/spotify:playlist:([A-Za-z0-9]+)/);
  if (uriMatch) {
    return `https://open.spotify.com/embed/playlist/${uriMatch[1]}?utm_source=generator&theme=0`;
  }
  // album / track support
  const albumMatch = trimmed.match(/open\.spotify\.com\/album\/([A-Za-z0-9]+)/);
  if (albumMatch) return `https://open.spotify.com/embed/album/${albumMatch[1]}?utm_source=generator&theme=0`;
  const trackMatch = trimmed.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/);
  if (trackMatch) return `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator&theme=0`;
  return null;
}

export function SpotifyPlayer() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setCustomUrl(stored);
  }, []);

  const activeUrl = customUrl ?? PRESETS[activeIdx].url;

  function applyCustom() {
    const url = normalizeSpotifyUrl(input);
    if (!url) {
      setError("Paste a Spotify playlist, album, or track URL.");
      return;
    }
    setCustomUrl(url);
    localStorage.setItem(STORAGE_KEY, url);
    setError(null);
    setEditing(false);
    setInput("");
  }

  function clearCustom() {
    setCustomUrl(null);
    localStorage.removeItem(STORAGE_KEY);
    setEditing(false);
    setInput("");
  }

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-[var(--color-cream)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted">
            now lifting / sound
          </span>
        </div>
        <button
          type="button"
          onClick={() => setEditing((s) => !s)}
          className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted hover:text-text-primary"
        >
          {editing ? <X className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
          {editing ? "close" : customUrl ? "change" : "use your own"}
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border-subtle"
          >
            <div className="px-5 py-4">
              <label className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-dim">
                spotify URL
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="h-10 flex-1 rounded-none border border-border bg-[var(--color-bg-elevated)] px-3 font-mono text-[12px] outline-none focus:border-[var(--color-bone)]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={applyCustom}
                    className="inline-flex h-10 items-center gap-1.5 bg-[var(--color-bone)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-bg-base)] hover:opacity-90"
                  >
                    <Check className="h-3 w-3" /> set
                  </button>
                  {customUrl && (
                    <button
                      onClick={clearCustom}
                      className="inline-flex h-10 items-center gap-1.5 border border-border-strong bg-transparent px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary hover:border-[var(--color-bone)] hover:text-[var(--color-bone)]"
                    >
                      reset
                    </button>
                  )}
                </div>
              </div>
              {error && <div className="mt-2 font-mono text-[10px] text-[var(--color-blood)]">{error}</div>}
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-text-dim">
                Paste any Spotify playlist, album, or track URL. Stored locally on this device.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!customUrl && (
        <div className="hairline-bottom flex flex-wrap gap-1 px-3 py-2.5">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setActiveIdx(i)}
              className={`group flex flex-col gap-0.5 border px-3 py-1.5 text-left transition ${
                activeIdx === i
                  ? "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]"
                  : "border-border-subtle bg-transparent text-text-secondary hover:border-border-strong"
              }`}
            >
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]">
                {p.label}
              </span>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                  activeIdx === i ? "text-[var(--color-bg-base)]/60" : "text-text-dim"
                }`}
              >
                {p.vibe}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="bg-black p-3">
        <iframe
          key={activeUrl}
          src={activeUrl}
          width="100%"
          height="232"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ borderRadius: 4 }}
          title="Spotify Player"
        />
      </div>

      <div className="flex items-center justify-between gap-1.5 border-t border-border-subtle px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
        <span className="flex items-center gap-1.5">
          <Music2 className="h-3 w-3 text-[var(--color-cream)]" />
          {customUrl ? "your playlist" : "curated for the lift"}
        </span>
        <span className="hidden sm:inline">&ldquo;train hard. recover harder.&rdquo;</span>
      </div>
    </div>
  );
}
