import { supabase } from "../lib/supabaseClient";

export type AdminProductVariant = {
  id: string;
  name: string;
  price: number;
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
  }));
}

export async function createAdminProduct(
  productData: Omit<AdminProduct, "id" | "variants">,
  variants: Array<Omit<AdminProductVariant, "id"> & { id?: string }>
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

  return { ...product, variants: [] } as any; 
}

export async function updateAdminProduct(
  id: string,
  productData: Omit<AdminProduct, "id" | "variants">,
  variants: Array<Omit<AdminProductVariant, "id"> & { id?: string }>
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

  // Insert and update
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
}

export const adminProductService = {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
};
