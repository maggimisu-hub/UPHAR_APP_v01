"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { buildCartLines, getCartCount, getCartSubtotal, loadCart, saveCart } from "@/lib/cart-storage";
import type { CartItem } from "@/types/storefront";

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (productId: string, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveCart(items);
  }, [hydrated, items]);

  const addItem = (productId: string, size: string) => {
    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.productId === productId && item.size === size);

      if (!existing) {
        return [...currentItems, { productId, size, quantity: 1 }];
      }

      return currentItems.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    });
  };

  const removeItem = (productId: string, size: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => !(item.productId === productId && item.size === size)),
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId && item.size === size ? { ...item, quantity } : item,
      ),
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        hydrated,
        itemCount: getCartCount(items),
        subtotal: getCartSubtotal(items),
        addItem,
        removeItem,
        updateQuantity,
        clearCart: () => setItems([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return {
    ...context,
    lines: buildCartLines(context.items),
  };
}

