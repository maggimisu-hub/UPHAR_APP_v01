import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/storefront";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-[28px] bg-white">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={900}
            height={1200}
            className="aspect-[4/5] h-auto w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 rounded-full bg-pearl/90 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-ink">
            {product.tag}
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base text-ink">{product.name}</h3>
            <p className="mt-1 text-sm text-stone">{product.category}</p>
          </div>
          <p className="text-sm text-ink">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}

