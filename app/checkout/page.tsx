"use client";

import { Button } from "@/components/forms/button";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { useCart } from "@/components/providers/cart-provider";

export default function CheckoutPage() {
  const { lines } = useCart();

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Checkout"
          title="Fast, clean, mobile-first checkout."
          description="Structured to support future payment gateways, authentication, and backend order orchestration."
        />
        <div className="mt-10">
          {lines.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-sand bg-white p-8 text-center sm:p-12">
              <h2 className="font-serif text-3xl text-ink">Nothing to check out yet.</h2>
              <p className="mt-4 text-sm leading-7 text-stone">Add products to your cart, then return to complete your order.</p>
              <Button href="/" className="mt-8">
                Browse products
              </Button>
            </div>
          ) : (
            <CheckoutForm />
          )}
        </div>
      </Container>
    </section>
  );
}

