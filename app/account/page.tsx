"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/forms/button";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { buildCartLines } from "@/lib/cart-storage";
import { loadOrders } from "@/lib/order-storage";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/types/storefront";

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Account"
          title="A simple dashboard ready for real authentication later."
          description="Track orders, payment status, and client details through a UI that can connect cleanly to Supabase or any backend service."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[32px] border border-sand bg-white p-6 shadow-soft sm:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-stone">Profile</p>
            <h2 className="mt-4 font-serif text-3xl text-ink">Client dashboard</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-stone">
              <p>Prepared for secure sign-in, saved addresses, loyalty logic, and personalized recommendations.</p>
              <p>Current implementation uses local persistence so frontend behavior can evolve independently from backend integration.</p>
            </div>
            <Button href="/women" className="mt-8">
              Continue shopping
            </Button>
          </div>

          <div className="space-y-5">
            {orders.length === 0 ? (
              <div className="rounded-[32px] border border-dashed border-sand bg-white p-8 text-center">
                <h3 className="font-serif text-2xl text-ink">No orders yet.</h3>
                <p className="mt-3 text-sm leading-7 text-stone">Complete checkout to see confirmed orders and payment status here.</p>
              </div>
            ) : (
              orders.map((order) => {
                const lineItems = buildCartLines(order.items);

                return (
                  <article key={order.id} className="rounded-[32px] border border-sand bg-white p-6 shadow-soft sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-stone">{order.id}</p>
                        <h3 className="mt-3 font-serif text-2xl text-ink">Order placed {formatDate(order.createdAt)}</h3>
                      </div>
                      <div className="text-right text-sm text-stone">
                        <p>
                          Order: <span className="text-ink">{order.orderStatus}</span>
                        </p>
                        <p className="mt-1">
                          Payment: <span className="text-ink">{order.paymentStatus}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4 border-t border-sand pt-6">
                      {lineItems.map((line) => (
                        <div key={`${line.product.id}-${line.size}`} className="flex items-center justify-between gap-4 text-sm">
                          <div>
                            <p className="text-ink">{line.product.name}</p>
                            <p className="mt-1 text-stone">{line.size} x {line.quantity}</p>
                          </div>
                          <p className="text-ink">{formatPrice(line.lineTotal)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-sand pt-6 text-sm">
                      <span className="text-stone">Shipping to {order.shipping.city}</span>
                      <span className="font-medium text-ink">{formatPrice(order.subtotal)}</span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

