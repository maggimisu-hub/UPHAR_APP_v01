import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useStore } from "../context/StoreContext";
import { formatPrice } from "../lib/format";
import type { Product } from "../types";
import Button from "./Button";

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);

  return (
    <div className="rounded-sm border border-primary/10 bg-ivory p-6 sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.3em] text-charcoal/70">{product.tag}</p>
      <h1 className="mt-4 text-[1.375rem] font-semibold leading-[1.25] text-primary sm:text-[1.75rem]">{product.name}</h1>
      <p className="mt-4 text-[18px] font-bold text-accent">{formatPrice(product.price)}</p>
      <p className="mt-6 text-sm leading-6 text-muted">{product.description}</p>

      <div className="mt-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-charcoal/70">Bangle size / Fit guide</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`min-w-14 rounded-sm border px-4 py-3 text-sm transition ${
                selectedSize === size
                  ? "border-accent bg-accent text-ivory"
                  : "border-primary/15 text-primary hover:border-accent hover:text-accent"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1"
          onClick={() => {
            addToCart(product.id, selectedSize);
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1800);
          }}
        >
          Add to cart
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => {
            addToCart(product.id, selectedSize);
            navigate("/checkout");
          }}
        >
          Reserve and checkout
        </Button>
      </div>

      <p className="mt-4 text-sm text-charcoal/70">{added ? "Added to cart." : "Gift-ready packaging available on request."}</p>
    </div>
  );
}
