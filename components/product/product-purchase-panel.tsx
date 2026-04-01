"use client";

import { useState } from "react";

import { Button } from "@/components/forms/button";
import { useCart } from "@/components/providers/cart-provider";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types/storefront";

type ProductPurchasePanelProps = {
  product: Product;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product.id, selectedSize);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="rounded-[32px] border border-sand bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-stone">{product.tag}</p>
      <h1 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">{product.name}</h1>
      <p className="mt-4 text-xl text-ink">{formatPrice(product.price)}</p>
      <p className="mt-6 text-sm leading-7 text-stone">{product.description}</p>

      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.28em] text-stone">Select size</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "min-w-14 rounded-full border border-sand px-4 py-3 text-sm text-ink transition hover:border-ink",
                selectedSize === size && "border-ink bg-ink text-pearl",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button className="flex-1" size="lg" onClick={handleAddToCart}>
          Add to cart
        </Button>
        <Button href="/checkout" variant="secondary" className="flex-1" size="lg">
          Buy now
        </Button>
      </div>

      <p className={cn("mt-4 text-sm text-stone transition", added && "text-ink")}>{added ? "Added to cart." : "Free exchanges within 7 days."}</p>
    </div>
  );
}

