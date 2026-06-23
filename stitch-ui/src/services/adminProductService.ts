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

async function deleteProductMediaFromStorage(urls: string[]): Promise<void> {
  const storagePaths = urls
    .map((url) => extractStoragePath(url))
    .filter((path): path is string => Boolean(path));

  if (storagePaths.length === 0) {
    return;
  }

  const { error } = await supabase.storage
    .from("product-media")
    .remove(storagePaths);

  if (error) {
    throw new Error(`Failed to delete product media from storage: ${error.message}`);
  }
}
export type AdminProductVariant = {
  id: string;
  name: string;
  price: number;
  mrp_price: number | null;
  discount_percent: number | null;
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
  mrp_price: number | null;
  discount_percent: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  product_type: string;
  product_collection: string;
  is_returnable: boolean;
  return_policy_note: string | null;
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
      mrp_price,
      discount_percent,
      is_active,
      is_featured,
      is_new,
      product_type,
      product_collection,
      is_returnable,
      return_policy_note,
      product_variants (
        id,
        name,
        price,
        mrp_price,
        discount_percent
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
    mrp_price: product.mrp_price,
    discount_percent: product.discount_percent,
    is_active: product.is_active,
    is_featured: product.is_featured,
    is_new: product.is_new,
    product_type: product.product_type,
    product_collection: product.product_collection,
    is_returnable: product.is_returnable,
    return_policy_note: product.return_policy_note,
    variants: (product.product_variants ?? []).map((variant: any) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price,
      mrp_price: variant.mrp_price,
      discount_percent: variant.discount_percent,
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
      mrp_price: v.mrp_price ?? null,
      discount_percent: v.discount_percent ?? null,
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

  // Fetch existing variants and media in parallel
  const [variantsResult, mediaResult] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", id),
    supabase
      .from("product_images")
      .select("id, image_url")
      .eq("product_id", id),
  ]);

  if (variantsResult.error) {
    throw new Error(`Failed to fetch variants: ${variantsResult.error.message}`);
  }
  if (mediaResult.error) {
    throw new Error(`Failed to fetch media: ${mediaResult.error.message}`);
  }

  const existingVariants = variantsResult.data ?? [];
  const existingMedia = mediaResult.data ?? [];

  // Determine variants to delete/insert/update
  const existingIds = new Set(existingVariants.map((v) => v.id));
  const newIds = new Set(variants.filter((v) => v.id).map((v) => v.id));
  const toDelete = Array.from(existingIds).filter((vid) => !newIds.has(vid));

  const variantsToInsert = variants
    .filter((v) => !v.id)
    .map((v) => ({
      product_id: id,
      name: v.name,
      price: v.price,
      mrp_price: v.mrp_price ?? null,
      discount_percent: v.discount_percent ?? null,
    }));

  const variantsToUpdate = variants.filter((v) => v.id);

  // Determine media to delete/insert/update
  const existingMediaMap = new Map(existingMedia.map((m) => [m.id, m.image_url]));
  const newMediaIds = new Set(media.filter((m) => m.id).map((m) => m.id));
  const toDeleteMediaIds = Array.from(existingMediaMap.keys()).filter((mid) => !newMediaIds.has(mid));

  const mediaToInsert = media
    .filter((m) => !m.id)
    .map((m) => ({
      product_id: id,
      image_url: m.image_url,
      is_video: m.is_video,
      display_order: m.display_order,
    }));

  const mediaToUpdate = media.filter((m) => m.id);

  // Perform deletions in parallel
  const deletePromises: Promise<void>[] = [];

  if (toDelete.length > 0) {
    deletePromises.push(
      (async () => {
        const { error } = await supabase.from("product_variants").delete().in("id", toDelete);
        if (error) throw new Error(`Failed to delete variants: ${error.message}`);
      })()
    );
  }

  let storageDeletePromise: Promise<void> | null = null;
  if (toDeleteMediaIds.length > 0) {
    deletePromises.push(
      (async () => {
        const { error } = await supabase.from("product_images").delete().in("id", toDeleteMediaIds);
        if (error) throw new Error(`Failed to delete media rows: ${error.message}`);
      })()
    );

    const storagePaths: string[] = [];
    for (const mid of toDeleteMediaIds) {
      const url = existingMediaMap.get(mid);
      if (!url) continue;
      const storagePath = extractStoragePath(url);
      if (storagePath) storagePaths.push(storagePath);
    }

    if (storagePaths.length > 0) {
      storageDeletePromise = (async () => {
        const { error: storageRemoveError } = await supabase.storage
          .from("product-media")
          .remove(storagePaths);
        if (storageRemoveError) {
          throw new Error(`Media rows deleted but failed to remove storage files: ${storageRemoveError.message}`);
        }
      })();
    }
  }

  await Promise.all([
    ...deletePromises,
    ...(storageDeletePromise ? [storageDeletePromise] : []),
  ]);

  // Perform updates and inserts in parallel
  const writePromises: Promise<any>[] = [];

  // Update existing variants
  for (const variant of variantsToUpdate) {
    writePromises.push(
      (async () => {
        const { error } = await supabase
          .from("product_variants")
          .update({
            name: variant.name,
            price: variant.price,
            mrp_price: variant.mrp_price ?? null,
            discount_percent: variant.discount_percent ?? null,
          })
          .eq("id", variant.id!);
        if (error) throw new Error(`Failed to update variant: ${error.message}`);
      })()
    );
  }

  // Update existing media
  for (const m of mediaToUpdate) {
    writePromises.push(
      (async () => {
        const { error } = await supabase
          .from("product_images")
          .update({
            image_url: m.image_url,
            is_video: m.is_video,
            display_order: m.display_order,
          })
          .eq("id", m.id!);
        if (error) throw new Error(`Failed to update media: ${error.message}`);
      })()
    );
  }

  // Insert new variants in bulk & initialize inventory in bulk
  if (variantsToInsert.length > 0) {
    writePromises.push(
      (async () => {
        const { data: inserted, error: insertError } = await supabase
          .from("product_variants")
          .insert(variantsToInsert)
          .select("id");
        if (insertError) throw new Error(`Failed to insert variants: ${insertError.message}`);

        if (inserted && inserted.length > 0) {
          const inventoryRows = inserted.map((v) => ({
            variant_id: v.id,
            stock: 0,
          }));
          const { error: invError } = await supabase.from("inventory").insert(inventoryRows);
          if (invError) throw new Error(`Failed to initialize inventory for variants: ${invError.message}`);
        }
      })()
    );
  }

  // Insert new media in bulk
  if (mediaToInsert.length > 0) {
    writePromises.push(
      (async () => {
        const { error } = await supabase.from("product_images").insert(mediaToInsert);
        if (error) throw new Error(`Failed to insert media: ${error.message}`);
      })()
    );
  }

  await Promise.all(writePromises);
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

export async function softDeleteAdminProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to soft delete product: ${error.message}`);
  }
}

export async function hardDeleteAdminProduct(id: string): Promise<void> {
  const { data: productImages, error: imagesError } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", id);

  if (imagesError) {
    throw new Error(`Failed to fetch product media before delete: ${imagesError.message}`);
  }

  const { error: deleteProductError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteProductError) {
    throw new Error(
      deleteProductError.code === "23503"
        ? "This product cannot be hard deleted because it is linked to existing orders."
        : `Failed to hard delete product: ${deleteProductError.message}`
    );
  }

  await deleteProductMediaFromStorage((productImages ?? []).map((item) => item.image_url));
}

export const adminProductService = {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  uploadProductMedia,
  softDeleteAdminProduct,
  hardDeleteAdminProduct,
};
