import { useEffect, useState, useCallback } from "react";
import type {
  HeroItem,
  HeroItemInput,
} from "../../services/adminHeroService";
import {
  fetchHeroItems,
  createHeroItem,
  updateHeroItem,
  deleteHeroItem,
  uploadHeroMedia,
  deleteHeroMediaFromStorage,
} from "../../services/adminHeroService";

const emptyForm: HeroItemInput = {
  eyebrow: "",
  headline: "",
  body_copy: "",
  cta_label: "Shop New Arrivals",
  cta_link: "/shop",
  media_url: null,
  is_video: false,
  is_active: false,
};

export default function HeroContent() {
  const [items, setItems] = useState<HeroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HeroItemInput>({ ...emptyForm });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchHeroItems();
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load hero items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── helpers ── */

  function isVideoFile(file: File) {
    return file.type.startsWith("video/");
  }

  function isVideoUrl(url: string) {
    return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setMediaFile(null);
    setMediaPreview(null);
    setShowForm(false);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(item: HeroItem) {
    setEditingId(item.id);
    setForm({
      eyebrow: item.eyebrow,
      headline: item.headline,
      body_copy: item.body_copy,
      cta_label: item.cta_label,
      cta_link: item.cta_link,
      media_url: item.media_url,
      is_video: item.is_video,
      is_active: item.is_active,
    });
    setMediaFile(null);
    setMediaPreview(item.media_url ?? null);
    setShowForm(true);
  }

  function handleMediaSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setForm((f) => ({ ...f, is_video: isVideoFile(file) }));
    setMediaPreview(URL.createObjectURL(file));
  }

  async function handleRemoveMedia() {
    // If editing and current media is a saved URL, delete from storage on save
    setMediaFile(null);
    setMediaPreview(null);
    setForm((f) => ({ ...f, media_url: null, is_video: false }));
  }

  /* ── save ── */

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);

      let finalMediaUrl = form.media_url;
      let finalIsVideo = form.is_video;
      let oldMediaToDelete: string | null = null;

      // 1. Handle media changes (upload new first)
      if (mediaFile) {
        // Determine if we are replacing something
        if (editingId) {
          const original = items.find((i) => i.id === editingId);
          if (original?.media_url) {
            oldMediaToDelete = original.media_url;
          }
        }
        
        // Upload the new file
        finalMediaUrl = await uploadHeroMedia(mediaFile);
        finalIsVideo = isVideoFile(mediaFile);
      } else if (form.media_url === null && editingId) {
        // Media was removed explicitly — mark for cleanup
        const original = items.find((i) => i.id === editingId);
        if (original?.media_url) {
          oldMediaToDelete = original.media_url;
        }
      }

      // 2. Commit to database
      const payload: HeroItemInput = {
        ...form,
        media_url: finalMediaUrl,
        is_video: finalIsVideo,
      };

      if (editingId) {
        await updateHeroItem(editingId, payload);
      } else {
        await createHeroItem(payload);
      }

      // 3. Cleanup old media only if DB update was successful
      if (oldMediaToDelete) {
        try {
          await deleteHeroMediaFromStorage(oldMediaToDelete);
        } catch (cleanupErr: any) {
          // Surface cleanup failure but don't revert the DB change as it's already committed
          console.error("Storage cleanup failed:", cleanupErr);
          alert(`Content saved, but old media cleanup failed: ${cleanupErr.message}`);
        }
      }

      resetForm();
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  /* ── delete ── */
  async function confirmDelete() {
    if (!itemToDelete) return;
    try {
      setSaving(true);
      setError(null);
      await deleteHeroItem(itemToDelete);
      if (editingId === itemToDelete) resetForm();
      setItemToDelete(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  }

  /* ── toggle active ── */

  async function handleToggleActive(item: HeroItem) {
    try {
      setError(null);
      await updateHeroItem(item.id, { is_active: !item.is_active });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to toggle status");
    }
  }

  /* ── render ── */

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-charcoal/60">
        Loading hero content…
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary">Homepage Hero</h2>
        {!showForm && (
          <button
            onClick={startCreate}
            className="rounded-sm bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ivory transition hover:bg-accent/90"
          >
            + New Hero
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-sm border border-accent/20 bg-accent/5 p-3 text-sm text-accent">
          {error}
        </div>
      )}

      {/* ── Form ── */}
      {showForm && (
        <div className="mt-6 rounded-sm border border-primary/15 bg-ivory p-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            {editingId ? "Edit Hero" : "Create Hero"}
          </h3>

          <div className="mt-5 grid gap-4">
            {/* Eyebrow */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/70">
                Eyebrow
              </label>
              <input
                type="text"
                value={form.eyebrow}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eyebrow: e.target.value }))
                }
                placeholder="e.g. Uphar"
                className="mt-1 w-full rounded-sm border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-charcoal/40 focus:border-accent focus:outline-none"
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/70">
                Headline
              </label>
              <input
                type="text"
                value={form.headline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, headline: e.target.value }))
                }
                placeholder="e.g. The Signature of Style"
                className="mt-1 w-full rounded-sm border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-charcoal/40 focus:border-accent focus:outline-none"
              />
            </div>

            {/* Body Copy */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/70">
                Body Copy
              </label>
              <textarea
                value={form.body_copy}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body_copy: e.target.value }))
                }
                rows={3}
                placeholder="Supporting text for the hero section"
                className="mt-1 w-full rounded-sm border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-charcoal/40 focus:border-accent focus:outline-none"
              />
            </div>

            {/* CTA Label */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/70">
                  CTA Label
                </label>
                <input
                  type="text"
                  value={form.cta_label}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cta_label: e.target.value }))
                  }
                  placeholder="Shop New Arrivals"
                  className="mt-1 w-full rounded-sm border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-charcoal/40 focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/70">
                  CTA Link
                </label>
                <input
                  type="text"
                  value={form.cta_link}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cta_link: e.target.value }))
                  }
                  placeholder="/shop"
                  className="mt-1 w-full rounded-sm border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-charcoal/40 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Media */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/70">
                Hero Media (image or video)
              </label>
              {mediaPreview ? (
                <div className="mt-2">
                  {(mediaFile ? isVideoFile(mediaFile) : form.is_video || (form.media_url && isVideoUrl(form.media_url))) ? (
                    <video
                      src={mediaPreview}
                      className="h-40 w-full rounded-sm border border-primary/15 object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Hero preview"
                      className="h-40 w-full rounded-sm border border-primary/15 object-cover"
                    />
                  )}
                  <div className="mt-2 flex gap-2">
                    <label className="cursor-pointer rounded-sm border border-accent px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent/10">
                      Replace
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleMediaSelect}
                      />
                    </label>
                    <button
                      onClick={handleRemoveMedia}
                      className="rounded-sm border border-accent/20 px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent/5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="mt-2 flex h-32 cursor-pointer items-center justify-center rounded-sm border-2 border-dashed border-primary/20 bg-white text-sm text-charcoal/50 transition hover:border-accent hover:text-accent">
                  Click to upload image or video
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleMediaSelect}
                  />
                </label>
              )}
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 text-sm text-primary">
              <input
                type="checkbox"
                checked={form.is_active ?? false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.checked }))
                }
                className="h-4 w-4 rounded border-primary/30 text-accent focus:ring-accent"
              />
              Publish as active hero (replaces any currently active hero)
            </label>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-sm bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ivory transition hover:bg-accent/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId ? "Update Hero" : "Create Hero"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-sm border border-primary/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition hover:border-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Items List ── */}
      {items.length === 0 && !showForm ? (
        <p className="mt-8 text-center text-sm text-charcoal/60">
          No hero items yet. Click "+ New Hero" to create one.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-sm border bg-ivory p-5 ${
                item.is_active
                  ? "border-accent/50 ring-1 ring-accent/20"
                  : "border-primary/15"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        item.is_active
                          ? "bg-primary/10 text-primary"
                          : "bg-charcoal/10 text-charcoal/60"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                    {item.is_video && (
                      <span className="inline-block rounded bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        Video
                      </span>
                    )}
                  </div>
                  {item.eyebrow && (
                    <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-charcoal/60">
                      {item.eyebrow}
                    </p>
                  )}
                  <h3 className="mt-1 font-display text-xl text-primary">
                    {item.headline || "(no headline)"}
                  </h3>
                  {item.body_copy && (
                    <p className="mt-1 text-sm text-charcoal/70 line-clamp-2">
                      {item.body_copy}
                    </p>
                  )}
                  {item.cta_label && (
                    <p className="mt-1 text-xs text-accent">
                      CTA: {item.cta_label} → {item.cta_link}
                    </p>
                  )}
                </div>

                {/* Media thumbnail */}
                {item.media_url && (
                  <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-sm border border-primary/10">
                    {item.is_video ? (
                      <video
                        src={item.media_url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.media_url}
                        alt="Hero thumb"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="rounded-sm border border-primary/15 px-3 py-1 text-xs font-semibold text-primary transition hover:border-accent hover:text-accent"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`rounded-sm border px-3 py-1 text-xs font-semibold transition ${
                    item.is_active
                      ? "border-charcoal/20 text-charcoal/60 hover:border-accent hover:text-accent"
                      : "border-primary/30 text-primary hover:bg-primary/5"
                  }`}
                >
                  {item.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setItemToDelete(item.id)}
                  className="rounded-sm border border-accent/20 px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent/5"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-sm bg-ivory p-6 shadow-xl border border-primary/10">
            <h4 className="font-display text-lg text-primary">Confirm Deletion</h4>
            <p className="mt-2 text-sm text-charcoal/70">
              Are you sure you want to delete this hero item? This action will permanently remove the record and its media from storage.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="flex-1 rounded-sm bg-accent py-2 text-xs font-bold uppercase tracking-wider text-ivory hover:bg-accent/90 disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete Permanently"}
              </button>
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 rounded-sm border border-primary/20 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
