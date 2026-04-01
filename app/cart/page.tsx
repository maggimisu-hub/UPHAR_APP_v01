"use client";

import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/forms/button";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { useCart } from "@/components/providers/cart-provider";

export default function CartPage() {
  const { lines, subtotal } = useCart();

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Cart"
          title="Review your bag before checkout."
          description="Adjust quantities, remove items, and continue when your edit feels complete."
        />

        {lines.length === 0 ? (
          <div className="mt-10 rounded-[32px] border border-dashed border-sand bg-white p-8 text-center sm:p-12">
            <h2 className="font-serif text-3xl text-ink">Your cart is empty.</h2>
            <p className="mt-4 text-sm leading-7 text-stone">Explore the latest premium essentials and add your preferred sizes.</p>
            <Button href="/" className="mt-8">
              Continue shopping
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              {lines.map((line) => (
                <CartLineItem key={`${line.product.id}-${line.size}`} line={line} />
              ))}
            </div>
            <CartSummary subtotal={subtotal} />
          </div>
        )}
      </Container>
    </section>
  );
}

