import { products } from "@/data/products";
import type { Category, Product } from "@/types/storefront";

export function getAllProducts() {
  return products;
}

export function getFeaturedProducts(limit = 4) {
  return products.filter((product) => product.featured).slice(0, limit);
}

export function getNewArrivals(limit = 4) {
  return products.filter((product) => product.newArrival).slice(0, limit);
}

export function getProductsByCategory(category: Category) {
  return products.filter((product) => product.category === category);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, limit);
}

export function searchProducts(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return products.filter((product) =>
    [product.name, product.description, product.category, product.tag]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

