"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Loader2, Trash2, Upload, X } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { uploadPhotoAction, listPhotosAction, deletePhotoAction } from "@/app/actions/photos";
import type { DBProgressPhoto } from "@/types/db";

type PhotoWithUrl = DBProgressPhoto & { signed_url: string | null };

const POSES: Array<{ value: "front" | "side" | "back" | "double-bi"; label: string }> = [
  { value: "front", label: "Front" },
  { value: "side", label: "Side" },
  { value: "back", label: "Back" },
  { value: "double-bi", label: "Double Bi" },
];

export function PhotoGrid() {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [pose, setPose] = useState<"front" | "side" | "back" | "double-bi">("front");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<PhotoWithUrl | null>(null);

  async function refresh() {
    setLoading(true);
    const list = await listPhotosAction();
    setPhotos(list);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleFile(f: File | null) {
    setFile(f);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    if (f) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  function upload() {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("pose", pose);
      fd.append("date", new Date().toISOString().slice(0, 10));
      const res = await uploadPhotoAction(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      handleFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await refresh();
    });
  }

  function remove(photo: PhotoWithUrl) {
    if (!confirm("Delete this photo permanently?")) return;
    startTransition(async () => {
      await deletePhotoAction(photo.id, photo.storage_path);
      setLightbox(null);
      await refresh();
    });
  }

  return (
    <>
      <Card>
        <CardHeader
          eyebrow="progress photos · private to you"
          action={
            <div className="flex gap-1">
              {POSES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPose(p.value)}
                  className={`border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] transition ${
                    pose === p.value
                      ? "border-[var(--color-bone)] bg-[var(--color-bone)] text-[var(--color-bg-base)]"
                      : "border-border-subtle text-text-muted hover:border-border-strong"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          }
        >
          <span className="inline-flex items-center gap-2">
            <Camera className="h-4 w-4 text-[var(--color-cream)]" />
            The Mirror
          </span>
        </CardHeader>
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div
              onClick={() => fileInput.current?.click()}
              className="relative grid h-32 cursor-pointer place-items-center border border-dashed border-border-strong bg-[var(--color-bg-elevated)] transition hover:border-[var(--color-bone)]"
            >
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="preview" className="max-h-full max-w-full object-contain" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleFile(null); if (fileInput.current) fileInput.current.value = ""; }}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-[var(--color-bg-base)] text-text-secondary hover:text-[var(--color-bone)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-center">
                  <Upload className="h-4 w-4 text-text-muted" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    drop a {pose} pose
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">
                    jpg / png · up to 8MB
                  </span>
                </div>
              )}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <button
              onClick={upload}
              disabled={!file || pending}
              className="inline-flex h-32 w-full items-center justify-center gap-2 bg-[var(--color-bone)] px-6 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-bg-base)] transition hover:opacity-90 disabled:opacity-40 sm:w-44"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-3.5 w-3.5" /> upload</>}
            </button>
          </div>

          {error && (
            <div className="mt-3 border border-[var(--color-blood)]/40 bg-[var(--color-blood-soft)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-blood)]">
              {error}
            </div>
          )}

          <div className="mt-5">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
              </div>
            ) : photos.length === 0 ? (
              <div className="grid place-items-center border border-dashed border-border-subtle bg-[var(--color-bg-elevated)]/40 py-10 text-center">
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-dim">
                  no photos yet · the mirror is honest
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((p) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setLightbox(p)}
                    className="group relative aspect-[3/4] overflow-hidden border border-border-subtle bg-[var(--color-bg-elevated)] transition hover:border-[var(--color-bone)]"
                  >
                    {p.signed_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.signed_url} alt={`${p.pose} ${p.date}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-text-dim">
                        <Camera className="h-6 w-6" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent p-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-bone)]">
                        {p.date}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-cream)]">
                        {p.pose}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {lightbox.signed_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lightbox.signed_url}
                alt={`${lightbox.pose} ${lightbox.date}`}
                className="max-h-[90vh] max-w-full object-contain"
              />
            )}
            <div className="absolute right-2 top-2 flex gap-2">
              <button
                onClick={() => remove(lightbox)}
                className="grid h-8 w-8 place-items-center border border-[var(--color-blood)]/40 bg-[var(--color-bg-surface)] text-[var(--color-blood)] hover:bg-[var(--color-blood-soft)]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setLightbox(null)}
                className="grid h-8 w-8 place-items-center border border-border-strong bg-[var(--color-bg-surface)] text-text-secondary hover:text-[var(--color-bone)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="absolute bottom-2 left-2 bg-[var(--color-bg-surface)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary">
              {lightbox.date} · {lightbox.pose}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Suppress unused
void Image;
