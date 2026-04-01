import BrandLogo from "../../components/BrandLogo";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import Button from "../../components/Button";
import { useStore } from "../../context/StoreContext";
import { formatPrice } from "../../lib/format";

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { orders, confirmPayment } = useStore();

  useEffect(() => {
    if (orderId) {
      confirmPayment(orderId);
    }
  }, [orderId]);

  const order = orders.find((entry) => entry.id === orderId);

  return (
    <section className="container-shell py-16 sm:py-20">
      <div className="mx-auto max-w-4xl rounded-[36px] border border-primary/15 bg-ivory p-8 sm:p-12">
        <BrandLogo className="h-12" />
        <p className="text-[11px] uppercase tracking-[0.32em] text-muted">Payment Status</p>
        <h1 className="mt-4 text-[1.375rem] font-bold leading-[1.25] text-primary sm:text-[1.75rem]">Payment confirmed</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Your Uphar order has been updated with <strong className="font-medium text-primary">order_status = confirmed</strong> and <strong className="font-medium text-primary">payment_status = paid</strong>.
        </p>

        <div className="mt-10 grid gap-6 rounded-[28px] bg-background-light p-6 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted">Order ID</p>
            <p className="mt-2 text-lg text-primary">{order?.id ?? orderId ?? "Unavailable"}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Order status</p>
            <p className="mt-2 text-lg capitalize text-primary">{order?.orderStatus ?? "pending"}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Paid amount</p>
            <p className="mt-2 text-lg text-primary">{order ? formatPrice(order.total) : "Awaiting order"}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/account">View account</Button>
          <Button href="/shop" variant="secondary">Continue shopping</Button>
        </div>
      </div>
    </section>
  );
}
