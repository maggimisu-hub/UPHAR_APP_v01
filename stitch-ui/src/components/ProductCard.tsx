import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

import { useStore } from "../context/StoreContext";
import { formatCollection, formatPrice } from "../lib/format";
import type { Product } from "../types";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const liked = wishlist.includes(product.id);

  return (
    <article className="group flex flex-col">
      <Link to={`/product/${product.id}`} className="relative overflow-hidden rounded-sm border border-primary/10 bg-ivory transition duration-300 group-hover:border-accent/60">
        <img
          src={product.images[0]}
          alt={product.name}
          className="aspect-[4/5] h-auto w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute left-4 top-4 rounded-sm bg-primary px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-ivory">
          {product.tag}
        </div>
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link to={`/product/${product.id}`} className="text-[18px] font-semibold leading-[1.3] text-primary transition duration-300 group-hover:text-accent">
            {product.name}
          </Link>
          <p className="text-[11px] uppercase tracking-[0.22em] text-charcoal/70">
            {formatCollection(product.category)}
          </p>
          <p className="pt-1 text-base font-bold text-accent">{formatPrice(product.price)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`rounded-sm border p-2 transition duration-300 ${liked ? "border-accent bg-accent text-ivory" : "border-primary/10 bg-ivory text-primary hover:border-accent hover:text-accent"}`}
            aria-label="Toggle wishlist"
          >
            <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => addToCart(product.id, product.sizes[0])}
            className="rounded-sm border border-primary/10 bg-ivory p-2 text-primary transition hover:border-accent hover:text-accent"
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
