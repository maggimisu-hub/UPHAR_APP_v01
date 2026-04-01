import { supabase } from "../lib/supabaseClient";

type SupabaseError = {
  message: string;
};

type ProductImageRow = {
  image_url: string;
};

type ProductVariantRow = {
  id: string;
  name: string;
  price: number;
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
  images: string[];
  variants: Array<{
    id: string;
    name: string;
    price: number;
  }>;
};

export async function getAllProducts(): Promise<StorefrontProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        description,
        price,
        is_featured,
        is_new,
        product_images (
          image_url
        ),
        product_variants (
          id,
          name,
          price
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    isFeatured: product.is_featured,
    isNew: product.is_new,
    images: (product.product_images ?? []).map((image) => image.image_url),
    variants: (product.product_variants ?? []).map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price,
    })),
  }));
}

export const productService = {
  getAllProducts,
};
