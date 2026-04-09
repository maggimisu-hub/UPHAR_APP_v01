import { supabase } from "../lib/supabaseClient";

export type HeroItem = {
  id: string;
  eyebrow: string;
  headline: string;
  body_copy: string;
  cta_label: string;
  cta_link: string;
  media_url: string | null;
  is_video: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HeroItemInput = {
  eyebrow: string;
  headline: string;
  body_copy: string;
  cta_label: string;
  cta_link: string;
  media_url?: string | null;
  is_video?: boolean;
  is_active?: boolean;
};

/**
 * Extract storage path from a hero media public URL.
 * Expected: .../storage/v1/object/public/product-media/hero/<filename>
 * Returns: "hero/<filename>"
 */
function extractHeroStoragePath(url: string): string | null {
  const marker = "/storage/v1/object/public/product-media/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.substring(idx + marker.length);
  if (!path.startsWith("hero/")) return null;
  return path;
}

/* ──────────────────  READ  ────────────────── */

export async function fetchHeroItems(): Promise<HeroItem[]> {
  const { data, error } = await supabase
    .from("hero_content")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveHero(): Promise<HeroItem | null> {
  const { data, error } = await supabase
    .from("hero_content")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

/* ──────────────────  CREATE  ────────────────── */

export async function createHeroItem(input: HeroItemInput): Promise<HeroItem> {
  // If creating as active, deactivate others first
  if (input.is_active) {
    await deactivateAllHeroes();
  }

  const { data, error } = await supabase
    .from("hero_content")
    .insert({
      eyebrow: input.eyebrow,
      headline: input.headline,
      body_copy: input.body_copy,
      cta_label: input.cta_label,
      cta_link: input.cta_link,
      media_url: input.media_url ?? null,
      is_video: input.is_video ?? false,
      is_active: input.is_active ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ──────────────────  UPDATE  ────────────────── */

export async function updateHeroItem(
  id: string,
  input: Partial<HeroItemInput>,
): Promise<HeroItem> {
  // If setting active, deactivate others first
  if (input.is_active) {
    await deactivateAllHeroes();
  }

  const { data, error } = await supabase
    .from("hero_content")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deactivateAllHeroes(): Promise<void> {
  const { error } = await supabase
    .from("hero_content")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("is_active", true);

  if (error) throw error;
}

/* ──────────────────  DELETE  ────────────────── */

export async function deleteHeroItem(id: string): Promise<void> {
  // 1. Fetch current item to get media_url
  const { data: item } = await supabase
    .from("hero_content")
    .select("media_url")
    .eq("id", id)
    .single();

  // 2. Delete the DB row first
  const { error: dbError } = await supabase
    .from("hero_content")
    .delete()
    .eq("id", id);

  if (dbError) throw dbError;

  // 3. Only after DB success, clean up storage
  if (item?.media_url) {
    await deleteHeroMediaFromStorage(item.media_url);
  }
}

/* ──────────────────  STORAGE  ────────────────── */

export async function uploadHeroMedia(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `hero/${filename}`;

  const { error } = await supabase.storage
    .from("product-media")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-media").getPublicUrl(path);

  return publicUrl;
}

export async function deleteHeroMediaFromStorage(url: string): Promise<void> {
  const storagePath = extractHeroStoragePath(url);
  if (!storagePath) return; // external URL or not managed by us

  const { error } = await supabase.storage
    .from("product-media")
    .remove([storagePath]);

  if (error) {
    throw new Error(`Failed to delete hero media from storage: ${error.message}`);
  }
}
