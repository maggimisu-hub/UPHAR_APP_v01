"use client";

import Link from "next/link";

import { Button } from "@/components/forms/button";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/utils";

type CartSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function CartSheet({ open, onClose }: CartSheetProps) {
  const { lines, subtotal } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-pearl shadow-soft transition duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-sand px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone">Bag</p>
            <h3 className="mt-2 font-serif text-2xl text-ink">Your selections</h3>
          </div>
          <button onClick={onClose} className="text-sm text-stone transition hover:text-ink" aria-label="Close cart">
            Close
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {lines.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-sand bg-canvas p-6">
              <p className="font-serif text-xl text-ink">Your bag is empty.</p>
              <p className="mt-2 text-sm leading-6 text-stone">Discover tailored essentials and elevated wardrobe staples.</p>
              <Button href="/women" className="mt-5 w-full" onClick={onClose}>
                Shop now
              </Button>
            </div>
          ) : (
            lines.map((line) => (
              <div key={`${line.product.id}-${line.size}`} className="flex gap-4 rounded-[28px] border border-sand bg-white p-4">
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-canvas">
                  <img src={line.product.images[0]} alt={line.product.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${line.product.id}`} onClick={onClose} className="font-medium text-ink">
                    {line.product.name}
                  </Link>
                  <p className="mt-1 text-sm text-stone">Size {line.size}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-ink">
                    <span>Qty {line.quantity}</span>
                    <span>{formatPrice(line.lineTotal)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-sand px-6 py-5">
          <div className="flex items-center justify-between text-sm text-stone">
            <span>Subtotal</span>
            <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button href="/cart" variant="secondary" className="w-full" onClick={onClose}>
              View cart
            </Button>
            <Button href="/checkout" className="w-full" onClick={onClose}>
              Checkout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

