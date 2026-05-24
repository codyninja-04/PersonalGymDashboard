"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type { DBProgressPhoto } from "@/types/db";

export interface PhotoUploadInput {
  pose: "front" | "side" | "back" | "double-bi";
  date?: string;
  file: File;
  notes?: string | null;
}

const BUCKET = "progress-photos";

export async function uploadPhotoAction(formData: FormData) {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File | null;
  const pose = String(formData.get("pose") ?? "front") as PhotoUploadInput["pose"];
  const date = (formData.get("date") as string | null) ?? new Date().toISOString().slice(0, 10);
  const notes = (formData.get("notes") as string | null) || null;

  if (!file || file.size === 0) return { error: "No file provided" };
  if (file.size > 8 * 1024 * 1024) return { error: "File must be under 8MB" };

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/${date}_${pose}_${Date.now()}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (uploadErr) return { error: uploadErr.message };

  const { error: insertErr } = await supabase.from("progress_photos").insert({
    user_id: user.id,
    date,
    pose,
    storage_path: path,
    notes,
  });
  if (insertErr) {
    // Best effort cleanup of orphan file
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: insertErr.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true, path };
}

export async function listPhotosAction(): Promise<Array<DBProgressPhoto & { signed_url: string | null }>> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: photos } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(60);

  if (!photos) return [];

  // Generate signed URLs (valid 1h) so private bucket can render
  const paths = (photos as DBProgressPhoto[]).map((p) => p.storage_path);
  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
  const urlMap = new Map(signed?.map((s) => [s.path, s.signedUrl]) ?? []);

  return (photos as DBProgressPhoto[]).map((p) => ({
    ...p,
    signed_url: urlMap.get(p.storage_path) ?? null,
  }));
}

export async function deletePhotoAction(id: string, path: string) {
  if (!isSupabaseConfigured()) return { ok: true, demo: true };
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase.storage.from(BUCKET).remove([path]);
  const { error } = await supabase.from("progress_photos").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
