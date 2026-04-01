import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import Button from "../../components/Button";
import { useStore } from "../../context/StoreContext";
import { formatPrice } from "../../lib/format";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { orders } = useStore();
  const order = useMemo(() => orders.find((entry) => entry.id === orderId), [orderId, orders]);

  return (
    <section className="container-shell py-16 sm:py-20">
      <div className="mx-auto max-w-4xl rounded-[36px] border border-primary/15 bg-ivory p-8 sm:p-12">
        <p className="text-[11px] uppercase tracking-[0.32em] text-muted">Payment Gateway</p>
        <h1 className="mt-4 text-[1.375rem] font-bold leading-[1.25] text-primary sm:text-[1.75rem]">Secure payment handoff</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          This screen represents the payment step for your Uphar jewellery order. The order remains pending until the return flow confirms payment.
        </p>

        <div className="mt-10 grid gap-6 rounded-[28px] bg-background-light p-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted">Order ID</p>
            <p className="mt-2 text-lg text-primary">{orderId ?? "Unavailable"}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Amount due</p>
            <p className="mt-2 text-lg text-primary">{order ? formatPrice(order.total) : "Awaiting order"}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href={orderId ? `/payment/return?orderId=${orderId}` : "/checkout"}>Complete payment</Button>
          <Button href="/cart" variant="secondary">Back to cart</Button>
        </div>
      </div>
    </section>
  );
}
