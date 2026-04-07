import { useState, useEffect } from "react";
import { formatPrice } from "../../lib/format";
import { adminProductService, type AdminProduct, type AdminProductMedia } from "../../services/adminProductService";

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    is_active: true,
    is_featured: false,
    is_new: false,
    variants: [] as { id?: string; name: string; price: number }[],
    media: [] as { id?: string; image_url: string; is_video: boolean; display_order: number; file?: File }[],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminProductService.getAdminProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const openForm = (product?: AdminProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_new: product.is_new,
        variants: [...product.variants],
        media: product.media ? product.media.map(m => ({ ...m })) : [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        is_active: true,
        is_featured: false,
        is_new: false,
        variants: [{ name: "Default", price: 0 }],
        media: [],
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setError(null);
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "", price: prev.price }],
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setFormData((prev) => {
      const newMedia = [...prev.media];
      // Running count of total non-video items already in the media list
      let currentImageCount = newMedia.filter(m => !m.is_video).length;
      let capReached = false;

      for (const file of files) {
        const isVid = file.type.startsWith('video/');

        if (!isVid) {
          if (currentImageCount >= 7) {
            capReached = true;
            continue; // Skip this file, try next (may be a video)
          }
          currentImageCount++;
        }

        newMedia.push({
          image_url: URL.createObjectURL(file),
          is_video: isVid,
          display_order: newMedia.length,
          file: file,
        });
      }

      if (capReached) {
        alert('Maximum 7 images allowed per product. Extra images were skipped.');
      }

      return { ...prev, media: newMedia };
    });
    // Reset file input
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    setFormData((prev) => {
      const newMedia = prev.media.filter((_, i) => i !== index);
      // Re-adjust display orders
      newMedia.forEach((m, idx) => m.display_order = idx);
      return { ...prev, media: newMedia };
    });
  };

  const moveMedia = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.media.length - 1) return prev;

      const newMedia = [...prev.media];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap
      [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
      
      // Update display bounds
      newMedia.forEach((m, idx) => m.display_order = idx);
      return { ...prev, media: newMedia };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.variants.length === 0) {
      setError("At least one variant is required.");
      return;
    }
    for (const v of formData.variants) {
      if (!v.name.trim()) {
        setError("Variant names cannot be empty.");
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // 1. Upload new media files
      const finalMedia = [...formData.media];
      for (let i = 0; i < finalMedia.length; i++) {
        const m = finalMedia[i];
        if (m.file) {
          const publicUrl = await adminProductService.uploadProductMedia(m.file);
          finalMedia[i] = { ...m, image_url: publicUrl };
          delete finalMedia[i].file;
        }
      }

      const productPayload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
      };

      if (editingProduct) {
        await adminProductService.updateAdminProduct(
          editingProduct.id,
          productPayload,
          formData.variants,
          finalMedia as Array<Omit<AdminProductMedia, "id"> & { id?: string }>
        );
      } else {
        await adminProductService.createAdminProduct(
          productPayload,
          formData.variants,
          finalMedia as Array<Omit<AdminProductMedia, "id"> & { id?: string }>
        );
      }
      
      await loadProducts();
      closeForm();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (product: AdminProduct) => {
    try {
      const productPayload = {
        name: product.name,
        description: product.description,
        price: product.price,
        is_active: !product.is_active,
        is_featured: product.is_featured,
        is_new: product.is_new,
      };
      await adminProductService.updateAdminProduct(product.id, productPayload, product.variants, product.media || []);
      await loadProducts();
    } catch (err: any) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  if (loading && products.length === 0) {
    return <div className="p-5 text-sm text-muted">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {error && !isFormOpen && (
        <div className="rounded-[12px] bg-accent/10 p-4 text-sm text-accent">
          {error}
        </div>
      )}

      {!isFormOpen ? (
        <div className="rounded-[28px] border border-primary/15 bg-ivory p-5">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Catalog</p>
            <button
              onClick={() => openForm()}
              className="rounded-full bg-primary px-4 py-2 text-xs text-white hover:bg-primary/90 transition-colors"
            >
              Add Product
            </button>
          </div>

          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-4 text-sm last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-primary font-medium">{product.name}</p>
                    {!product.is_active && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                        Inactive
                      </span>
                    )}
                    {product.is_featured && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                        Featured
                      </span>
                    )}
                    {product.is_new && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-muted text-xs line-clamp-1">{product.description || "No description"}</p>
                  <p className="mt-1 text-muted text-xs">{product.variants.length} variant(s)</p>
                </div>
                
                <div className="flex items-center gap-4 sm:justify-end">
                  <span className="text-charcoal font-medium whitespace-nowrap">{formatPrice(product.price)}</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(product)}
                      className="px-3 py-1.5 text-xs border border-primary/20 rounded-full hover:bg-primary/5 transition-colors"
                    >
                      {product.is_active ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => openForm(product)}
                      className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-muted py-4 text-center">No products found.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[28px] border border-primary/15 bg-ivory p-5">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted">
              {editingProduct ? "Edit Product" : "New Product"}
            </p>
            <button
              onClick={closeForm}
              className="text-xs text-muted hover:text-primary transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-[12px] bg-accent/10 p-4 text-sm text-accent">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-muted mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-none border-b border-primary/20 bg-transparent px-0 pb-2 pt-1 text-sm text-primary placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-none border-b border-primary/20 bg-transparent px-0 pb-2 pt-1 text-sm text-primary placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1">Description (Supports multiple lines)</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-[12px] border border-primary/20 bg-transparent p-3 text-sm text-primary placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-0 resize-y"
                    placeholder="Rich product description..."
                  />
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="accent-primary"
                    />
                    <span className="text-sm text-primary">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="accent-primary"
                    />
                    <span className="text-sm text-primary">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_new}
                      onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                      className="accent-primary"
                    />
                    <span className="text-sm text-primary">New Arrival</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs text-muted">Variants</label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-xs text-primary hover:text-primary/70 transition-colors"
                  >
                    + Add Variant
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-primary/10 rounded-[12px] bg-white">
                      <div className="flex-1 space-y-3">
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Variant Name (e.g. 18k Rose Gold, 10g)"
                            value={variant.name}
                            onChange={(e) => updateVariant(index, "name", e.target.value)}
                            className="w-full rounded-none border-b border-primary/20 bg-transparent px-0 pb-1 text-sm text-primary focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            placeholder="Variant Price (₹)"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value) || 0)}
                            className="w-full rounded-none border-b border-primary/20 bg-transparent px-0 pb-1 text-sm text-primary focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="mt-1 text-muted hover:text-accent transition-colors"
                          title="Remove Variant"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Media Management Section */}
            <div className="space-y-4 pt-6 border-t border-primary/10">
              <div className="flex items-center justify-between">
                <label className="block text-xs text-muted">
                  Media ({formData.media.filter(m => !m.is_video).length}/7 images, {formData.media.filter(m => m.is_video).length} video)
                </label>
                <label className="cursor-pointer text-xs text-primary hover:text-primary/70 transition-colors">
                  + Upload Files
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {formData.media.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-primary/15 py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted/50">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <p className="text-xs text-muted">No media uploaded yet</p>
                  <label className="cursor-pointer rounded-full bg-primary/10 px-4 py-1.5 text-xs text-primary hover:bg-primary/20 transition-colors">
                    Choose Images or Video
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {formData.media.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {formData.media.map((m, index) => (
                    <div key={m.id || `new-${index}`} className="relative group rounded-[12px] border border-primary/10 bg-white overflow-hidden">
                      {/* Preview */}
                      <div className="aspect-square bg-primary/5">
                        {m.is_video ? (
                          <div className="flex flex-col items-center justify-center h-full gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/60">
                              <polygon points="6 3 20 12 6 21 6 3"/>
                            </svg>
                            <span className="text-[10px] text-muted">Video</span>
                          </div>
                        ) : (
                          <img
                            src={m.image_url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>

                      {/* Overlay controls */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveMedia(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-full bg-white/90 text-primary hover:bg-white disabled:opacity-30 transition-colors"
                          title="Move left"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="p-1.5 rounded-full bg-white/90 text-accent hover:bg-white transition-colors"
                          title="Remove"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMedia(index, 'down')}
                          disabled={index === formData.media.length - 1}
                          className="p-1.5 rounded-full bg-white/90 text-primary hover:bg-white disabled:opacity-30 transition-colors"
                          title="Move right"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                      </div>

                      {/* Order badge */}
                      <div className="absolute top-1.5 left-1.5 rounded-full bg-primary/80 px-1.5 py-0.5 text-[9px] text-white font-medium">
                        {index + 1}
                      </div>

                      {/* Type badge */}
                      {m.is_video && (
                        <div className="absolute top-1.5 right-1.5 rounded-full bg-accent/80 px-1.5 py-0.5 text-[9px] text-white font-medium">
                          VID
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-muted/60">
                Drag order affects storefront display. Max 7 images + videos supported.
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-primary/10">
              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="px-6 py-2 text-sm text-muted hover:text-primary transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-primary px-8 py-2 text-sm text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
