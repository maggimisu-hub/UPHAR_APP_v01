import { useState } from "react";
import { useParams } from "react-router-dom";

import Button from "../../components/Button";
import { useStore } from "../../context/StoreContext";
import { formatDate, formatPrice } from "../../lib/format";

const TAKEAWAY_STEPS = [
  {
    id: "pending",
    title: "Order placed",
    description: "Your jewellery request is received. The store team will prepare your items.",
  },
  {
    id: "ready",
    title: "Ready for pickup",
    description: "Visit the store to collect your order and complete payment.",
  },
  {
    id: "delivered",
    title: "Collected & paid",
    description: "Order completed successfully at the store counter.",
  },
] as const;

function getTakeawayStep(orderStatus: string, paymentStatus: string): number {
  if (orderStatus === "delivered" && paymentStatus === "paid") {
    return 2;
  }

  if (orderStatus === "ready") {
    return 1;
  }

  return 0;
}

export default function OrderDetails() {
  const { id } = useParams();
  const { orders, getProductById, refreshOrders } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = orders.find((entry) => entry.id === id);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await refreshOrders();
    } catch (e) {
      setError("Failed to refresh status.");
    } finally {
      setRefreshing(false);
    }
  };

  if (!order) {
    return (
      <div className="container-shell py-24 text-center">
        <h1 className="text-[1.75rem] font-bold leading-[1.25] text-primary">Order not found</h1>
        <Button href="/account" className="mt-8">
          Back to account
        </Button>
      </div>
    );
  }

  const activeStep = getTakeawayStep(order.orderStatus, order.paymentStatus);

  return (
    <section className="container-shell py-16 sm:py-20">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Order details</p>
          <h1 className="mt-3 text-[1.375rem] font-bold leading-[1.25] text-primary">{order.id}</h1>
          <p className="mt-2 text-sm text-muted">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-xs"
        >
          {refreshing ? "Refreshing..." : "Refresh status"}
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-accent">{error}</p>}

      <div className="mt-8 rounded-[28px] border border-primary/15 bg-ivory p-5">
        <p className="text-sm text-muted">Status</p>
        <p className="mt-2 capitalize text-primary">{order.orderStatus}</p>
        <p className="mt-1 text-sm text-muted">Payment: {order.paymentStatus}</p>
      </div>

      <div className="mt-6 rounded-[28px] border border-primary/15 bg-ivory p-5">
        <p className="text-sm text-muted">Takeaway progress</p>
        {order.orderStatus === "cancelled" ? (
          <p className="mt-3 text-sm text-accent">
            This order was cancelled. Contact the store if you need help.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {TAKEAWAY_STEPS.map((step, index) => {
              const isDone = index <= activeStep;
              return (
                <div key={step.id} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                      isDone ? "bg-accent" : "bg-primary/20"
                    }`}
                  />
                  <div>
                    <p className={isDone ? "text-primary" : "text-muted"}>{step.title}</p>
                    <p className="mt-1 text-xs text-muted">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-6 rounded-[28px] border border-primary/15 bg-ivory p-5">
        <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">Takeaway instructions</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="text-muted">Pickup Location</p>
            <p className="text-primary font-medium">Uphar Flagship Store, Delhi</p>
          </div>
          <div>
            <p className="text-muted">Timing Window</p>
            <p className="text-primary font-medium">11:00 AM - 7:00 PM (Mon-Sat)</p>
          </div>
          <div>
            <p className="text-muted">Store Contact</p>
            <p className="text-primary font-medium">+91 98765 43210</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-accent/10 px-4 py-3">
          <p className="text-xs text-accent">Note: Bring your Order ID {order.id} at pickup.</p>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-primary/15 bg-ivory p-5">
        <p className="text-sm text-muted">Items</p>
        <div className="mt-4 space-y-4">
          {order.items.length === 0 ? (
            <p className="text-sm text-muted">Item details are being synced. Please refresh shortly.</p>
          ) : (
            order.items.map((item) => {
              const product = getProductById(item.productId);
              return (
                <div key={`${item.productId}-${item.size}`} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-primary">{product?.name ?? "Jewellery item"}</p>
                    <p className="text-muted">Variant {item.size} x {item.quantity}</p>
                  </div>
                  <span className="text-charcoal">
                    {formatPrice((product?.price ?? 0) * item.quantity)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-primary/15 bg-ivory p-5 text-sm text-muted">
        <p className="text-primary">Pickup details</p>
        <p className="mt-2">{order.shipping.name}</p>
        <p className="mt-1">{order.shipping.phone}</p>
        <p className="mt-2">{order.shipping.address}</p>
        <p>{order.shipping.city} {order.shipping.pincode}</p>
      </div>

      <div className="mt-6 rounded-[28px] border border-primary/15 bg-ivory p-5 text-sm">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-muted">
          <span>Shipping</span>
          <span>{formatPrice(order.shippingCost)}</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-primary/15 pt-4 text-charcoal">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </section>
  );
}
