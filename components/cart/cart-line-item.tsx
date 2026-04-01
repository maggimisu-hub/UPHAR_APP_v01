"use client";

import Image from "next/image";

import { Button } from "@/components/forms/button";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types/storefront";

type CartLineItemProps = {
  line: CartLine;
};

export function CartLineItem({ line }: CartLineItemProps) {
  const { removeItem, updateQuantity } = useCart();

  return (
    <div className="grid gap-4 rounded-[28px] border border-sand bg-white p-4 sm:grid-cols-[160px_1fr] sm:p-5">
      <div className="overflow-hidden rounded-[24px] bg-canvas">
        <Image src={line.product.images[0]} alt={line.product.name} width={600} height={750} className="aspect-[4/5] h-auto w-full object-cover" />
      </div>
      <div className="flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg text-ink">{line.product.name}</h3>
              <p className="mt-1 text-sm text-stone">Size {line.size}</p>
            </div>
            <p className="text-sm text-ink">{formatPrice(line.lineTotal)}</p>
          </div>
          <p className="mt-4 max-w-lg text-sm leading-7 text-stone">{line.product.description}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-full border border-sand bg-pearl p-1">
            <button
              onClick={() => updateQuantity(line.product.id, line.size, line.quantity - 1)}
              className="h-10 w-10 rounded-full text-lg text-ink transition hover:bg-white"
            >
              -
            </button>
            <span className="min-w-12 text-center text-sm text-ink">{line.quantity}</span>
            <button
              onClick={() => updateQuantity(line.product.id, line.size, line.quantity + 1)}
              className="h-10 w-10 rounded-full text-lg text-ink transition hover:bg-white"
            >
              +
            </button>
          </div>
          <Button variant="ghost" className="justify-start px-0" onClick={() => removeItem(line.product.id, line.size)}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

