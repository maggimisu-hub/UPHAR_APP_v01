import { supabase } from "../lib/supabaseClient";

/**
 * Extracts the storage object path from a Supabase public URL for the product-media bucket.
 * Returns null for URLs that don't belong to managed product media storage.
 *
 * Expected URL pattern:
 *   https://<project>.supabase.co/storage/v1/object/public/product-media/products/<filename>
 * Returns:
 *   "products/<filename>"
 */
function extractStoragePath(url: string): string | null {
  const marker = "/storage/v1/object/public/product-media/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.substring(idx + marker.length);
  // Only allow paths within the products/ subfolder managed by this app
  if (!path.startsWith("products/")) return null;
  return path;
}
export type AdminProductVariant = {
  id: string;
  name: string;
  price: number;
};

export type AdminProductMedia = {
  id: string;
  image_url: string;
  is_video: boolean;
  display_order: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  variants: AdminProductVariant[];
  media: AdminProductMedia[];
};

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      is_active,
      is_featured,
      is_new,
      product_variants (
        id,
        name,
        price
      ),
      product_images (
        id,
        image_url,
        is_video,
        display_order
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch admin products: ${error.message}`);
  }

  return (data ?? []).map((product: any) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    is_active: product.is_active,
    is_featured: product.is_featured,
    is_new: product.is_new,
    variants: (product.product_variants ?? []).map((variant: any) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price,
    })).sort((a: any, b: any) => a.name.localeCompare(b.name)),
    media: (product.product_images ?? []).map((m: any) => ({
      id: m.id,
      image_url: m.image_url,
      is_video: m.is_video,
      display_order: m.display_order,
    })).sort((a: any, b: any) => a.display_order - b.display_order),
  }));
}

export async function createAdminProduct(
  productData: Omit<AdminProduct, "id" | "variants" | "media">,
  variants: Array<Omit<AdminProductVariant, "id"> & { id?: string }>,
  media: Array<Omit<AdminProductMedia, "id"> & { id?: string }>
): Promise<AdminProduct> {
  // Insert product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert([productData])
    .select()
    .single();

  if (productError) {
    throw new Error(`Failed to create product: ${productError.message}`);
  }

  // Insert variants
  if (variants.length > 0) {
    const variantData = variants.map((v) => ({
      product_id: product.id,
      name: v.name,
      price: v.price,
    }));
    const { data: insertedVariants, error: variantsError } = await supabase
      .from("product_variants")
      .insert(variantData)
      .select();

    if (variantsError) {
      throw new Error(`Failed to create variants: ${variantsError.message}`);
    }

    if (insertedVariants && insertedVariants.length > 0) {
      const inventoryData = insertedVariants.map((v: { id: string }) => ({
        variant_id: v.id,
        stock: 0,
      }));
      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert(inventoryData);

      if (inventoryError) {
        throw new Error(`Failed to initialize inventory: ${inventoryError.message}`);
      }
    }
  }

  // Insert media
  if (media.length > 0) {
    const mediaData = media.map((m) => ({
      product_id: product.id,
      image_url: m.image_url,
      is_video: m.is_video,
      display_order: m.display_order,
    }));
    const { error: mediaError } = await supabase
      .from("product_images")
      .insert(mediaData);

    if (mediaError) {
      throw new Error(`Failed to create media: ${mediaError.message}`);
    }
  }

  return { ...product, variants: [], media: [] } as any; 
}

export async function updateAdminProduct(
  id: string,
  productData: Omit<AdminProduct, "id" | "variants" | "media">,
  variants: Array<Omit<AdminProductVariant, "id"> & { id?: string }>,
  media: Array<Omit<AdminProductMedia, "id"> & { id?: string }>
): Promise<void> {
  const { error: productError } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id);

  if (productError) {
    throw new Error(`Failed to update product: ${productError.message}`);
  }

  // Handle variants
  const { data: existingVariants, error: fetchError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", id);

  if (fetchError) throw new Error(`Failed to fetch variants: ${fetchError.message}`);

  const existingIds = new Set((existingVariants ?? []).map((v) => v.id));
  const newIds = new Set(variants.filter((v) => v.id).map((v) => v.id));

  // Delete missing variants
  const toDelete = Array.from(existingIds).filter((vid) => !newIds.has(vid));
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase.from("product_variants").delete().in("id", toDelete);
    if (deleteError) throw new Error(`Failed to delete variants: ${deleteError.message}`);
  }

  // Insert and update variants
  for (const variant of variants) {
    if (variant.id) {
      const { error: updateError } = await supabase
        .from("product_variants")
        .update({ name: variant.name, price: variant.price })
        .eq("id", variant.id);
      if (updateError) throw new Error(`Failed to update variant: ${updateError.message}`);
    } else {
      const { data: insertedVariant, error: insertError } = await supabase
        .from("product_variants")
        .insert([{ product_id: id, name: variant.name, price: variant.price }])
        .select()
        .single();
      if (insertError) throw new Error(`Failed to insert variant: ${insertError.message}`);

      if (insertedVariant) {
        const { error: invError } = await supabase
          .from("inventory")
          .insert([{ variant_id: insertedVariant.id, stock: 0 }]);
        if (invError) throw new Error(`Failed to initialize inventory for added variant: ${invError.message}`);
      }
    }
  }

  // Handle media — delete missing, update existing, insert new
  const { data: existingMedia, error: fetchMediaError } = await supabase
    .from("product_images")
    .select("id, image_url")
    .eq("product_id", id);

  if (fetchMediaError) throw new Error(`Failed to fetch media: ${fetchMediaError.message}`);

  const existingMediaMap = new Map((existingMedia ?? []).map((m) => [m.id, m.image_url]));
  const newMediaIds = new Set(media.filter((m) => m.id).map((m) => m.id));

  const toDeleteMediaIds = Array.from(existingMediaMap.keys()).filter((mid) => !newMediaIds.has(mid));
  if (toDeleteMediaIds.length > 0) {
    // 1. Delete DB rows
    const { error: deleteMediaError } = await supabase.from("product_images").delete().in("id", toDeleteMediaIds);
    if (deleteMediaError) throw new Error(`Failed to delete media rows: ${deleteMediaError.message}`);

    // 2. Delete underlying storage files for managed URLs
    const storagePaths: string[] = [];
    for (const mid of toDeleteMediaIds) {
      const url = existingMediaMap.get(mid);
      if (!url) continue;
      const storagePath = extractStoragePath(url);
      if (storagePath) storagePaths.push(storagePath);
    }

    if (storagePaths.length > 0) {
      const { error: storageDeleteError } = await supabase.storage
        .from("product-media")
        .remove(storagePaths);
      if (storageDeleteError) {
        throw new Error(`Media rows deleted but failed to remove storage files: ${storageDeleteError.message}`);
      }
    }
  }

  for (const m of media) {
    if (m.id) {
      const { error: updMediaError } = await supabase
        .from("product_images")
        .update({ image_url: m.image_url, is_video: m.is_video, display_order: m.display_order })
        .eq("id", m.id);
      if (updMediaError) throw new Error(`Failed to update media: ${updMediaError.message}`);
    } else {
      const { error: insMediaError } = await supabase
        .from("product_images")
        .insert([{ product_id: id, image_url: m.image_url, is_video: m.is_video, display_order: m.display_order }]);
      if (insMediaError) throw new Error(`Failed to insert media: ${insMediaError.message}`);
    }
  }
}

export async function uploadProductMedia(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from("product-media")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    throw new Error(`Failed to upload media: ${error.message}`);
  }

  const { data } = supabase.storage
    .from("product-media")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export const adminProductService = {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  uploadProductMedia,
};
