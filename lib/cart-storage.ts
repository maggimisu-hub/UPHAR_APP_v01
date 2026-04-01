import { getProductById } from "@/lib/product-service";
import type { CartItem, CartLine } from "@/types/storefront";

export const CART_STORAGE_KEY = "uphar-cart";

export function getCartCount(items: CartItem[]) {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function buildCartLines(items: CartItem[]): CartLine[] {
  return items.flatMap((item) => {
    const product = getProductById(item.productId);

    if (!product) {
      return [];
    }

    return [
      {
        product,
        size: item.size,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      },
    ];
  });
}

export function getCartSubtotal(items: CartItem[]) {
  return buildCartLines(items).reduce((total, item) => total + item.lineTotal, 0);
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function loadCart() {
  if (typeof window === "undefined") {
    return [] as CartItem[];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

