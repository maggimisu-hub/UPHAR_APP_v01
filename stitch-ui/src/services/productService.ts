import { supabase } from "../lib/supabaseClient";

type SupabaseError = {
  message: string;
};

type ProductImageRow = {
  image_url: string;
  is_video: boolean;
  display_order: number;
};

type ProductVariantRow = {
  id: string;
  name: string;
  price: number;
  inventory: Array<{ stock: number }> | null;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_featured: boolean;
  is_new: boolean;
  product_images: ProductImageRow[] | null;
  product_variants: ProductVariantRow[] | null;
};

export type StorefrontProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isFeatured: boolean;
  isNew: boolean;
  media: Array<{
    url: string;
    isVideo: boolean;
    displayOrder: number;
  }>;
  images: string[]; // Legacy compat: just the image URLs
  variants: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
};

export async function getAllProducts(): Promise<StorefrontProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      is_featured,
      is_new,
      product_images (
        image_url,
        is_video,
        display_order
      ),
      product_variants (
        id,
        name,
        price,
        inventory (
          stock
        )
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
  return (data ?? []).map((product: any) => {
    const sortedMedia = (product.product_images ?? [])
      .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      isFeatured: product.is_featured,
      isNew: product.is_new,
      media: sortedMedia.map((m: any) => ({
        url: m.image_url,
        isVideo: m.is_video ?? false,
        displayOrder: m.display_order ?? 0,
      })),
      images: sortedMedia
        .filter((m: any) => !m.is_video)
        .map((m: any) => m.image_url),
      variants: (product.product_variants ?? []).map((variant: any) => {
        const stockVal = Array.isArray(variant.inventory)
          ? variant.inventory[0]?.stock
          : variant.inventory?.stock;
        return {
          id: variant.id,
          name: variant.name,
          price: variant.price,
          stock: stockVal ?? 0,
        };
      }),
    };
  });
}

export const productService = {
  getAllProducts,
};
