"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/forms/button";
import { Container } from "@/components/layout/container";
import { useCart } from "@/components/providers/cart-provider";
import { getOrderById, updateOrderStatus } from "@/lib/order-storage";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/storefront";

type PaymentReturnScreenProps = {
  orderId?: string;
};

export function PaymentReturnScreen({ orderId }: PaymentReturnScreenProps) {
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | undefined>();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (!orderId || processed) {
      return;
    }

    const existingOrder = getOrderById(orderId);

    if (!existingOrder) {
      setProcessed(true);
      return;
    }

    const updatedOrder =
      existingOrder.paymentStatus === "paid"
        ? existingOrder
        : updateOrderStatus(orderId, {
            orderStatus: "confirmed",
            paymentStatus: "paid",
          });

    clearCart();
    setOrder(updatedOrder);
    setProcessed(true);
  }, [clearCart, orderId, processed]);

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-4xl">
        <div className="rounded-[36px] border border-sand bg-white p-8 shadow-soft sm:p-12">
          <p className="text-xs uppercase tracking-[0.32em] text-stone">Payment Status</p>
          <h1 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">Payment confirmed</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
            Your order has been updated with <strong className="font-medium text-ink">order_status = confirmed</strong> and <strong className="font-medium text-ink">payment_status = paid</strong>.
          </p>

          <div className="mt-10 grid gap-6 rounded-[28px] bg-canvas p-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-stone">Order ID</p>
              <p className="mt-2 text-lg text-ink">{order?.id ?? orderId ?? "Unavailable"}</p>
            </div>
            <div>
              <p className="text-sm text-stone">Order status</p>
              <p className="mt-2 text-lg capitalize text-ink">{order?.orderStatus ?? "pending"}</p>
            </div>
            <div>
              <p className="text-sm text-stone">Paid amount</p>
              <p className="mt-2 text-lg text-ink">{order ? formatPrice(order.subtotal) : "Awaiting order"}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/account" size="lg">
              View account
            </Button>
            <Button href="/" variant="secondary" size="lg">
              Continue shopping
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
