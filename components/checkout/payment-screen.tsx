"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/forms/button";
import { Container } from "@/components/layout/container";
import { getOrderById } from "@/lib/order-storage";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/storefront";

type PaymentScreenProps = {
  orderId?: string;
};

export function PaymentScreen({ orderId }: PaymentScreenProps) {
  const [order, setOrder] = useState<Order | undefined>();

  useEffect(() => {
    if (!orderId) {
      return;
    }

    setOrder(getOrderById(orderId));
  }, [orderId]);

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-4xl">
        <div className="rounded-[36px] border border-sand bg-white p-8 shadow-soft sm:p-12">
          <p className="text-xs uppercase tracking-[0.32em] text-stone">Payment Gateway</p>
          <h1 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">Simulated secure payment</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
            This screen stands in for a real gateway redirect. The order remains pending until the return URL simulates a successful confirmation.
          </p>

          <div className="mt-10 grid gap-6 rounded-[28px] bg-canvas p-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-stone">Order ID</p>
              <p className="mt-2 text-lg text-ink">{orderId ?? "Unavailable"}</p>
            </div>
            <div>
              <p className="text-sm text-stone">Amount due</p>
              <p className="mt-2 text-lg text-ink">{order ? formatPrice(order.subtotal) : "Awaiting order"}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={orderId ? `/payment/return?orderId=${orderId}` : "/checkout"} size="lg">
              Complete payment
            </Button>
            <Button href="/cart" variant="secondary" size="lg">
              Back to cart
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
