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

      {/* Return Policy */}
      <div className="mt-6 border-t border-primary/5 pt-6">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${product.is_returnable ? 'bg-primary' : 'bg-accent'}`} />
          <p className={`text-[11px] font-medium uppercase tracking-wider ${product.is_returnable ? 'text-primary' : 'text-accent'}`}>
            {product.is_returnable ? 'Returnable' : 'Final Sale / Non-Returnable'}
          </p>
        </div>
        {product.return_policy_note && (
          <p className="mt-1.5 text-xs text-charcoal/60">
            {product.return_policy_note}
          </p>
        )}
      </div>

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

      <div className="mt-8 flex flex-col gap-3">
        {selectedSize && (
          <p className={`text-sm font-medium ${
            (product.variantStock?.[selectedSize] ?? 0) === 0 
              ? "text-primary" 
              : (product.variantStock?.[selectedSize] ?? 0) <= 3 
                ? "text-accent" 
                : "text-muted"
          }`}>
            {(product.variantStock?.[selectedSize] ?? 0) === 0 
              ? "Out of stock" 
              : (product.variantStock?.[selectedSize] ?? 0) <= 3 
                ? `Limited: only ${product.variantStock?.[selectedSize]} left`
                : "In stock"}
          </p>
        )}
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1"
            disabled={(product.variantStock?.[selectedSize] ?? 0) === 0}
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
            disabled={(product.variantStock?.[selectedSize] ?? 0) === 0}
            onClick={() => {
              addToCart(product.id, selectedSize);
              navigate("/checkout");
            }}
          >
            Reserve and checkout
          </Button>
        </div>
      </div>

      <p className="mt-4 text-sm text-charcoal/70">{added ? "Added to cart." : "Gift-ready packaging available on request."}</p>
    </div>
  );
}
