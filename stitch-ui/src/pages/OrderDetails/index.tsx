import { useParams } from "react-router-dom";

import Button from "../../components/Button";
import { useStore } from "../../context/StoreContext";
import { formatDate, formatPrice } from "../../lib/format";

export default function OrderDetails() {
  const { id } = useParams();
  const { orders, getProductById } = useStore();

  const order = orders.find((entry) => entry.id === id);

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

  return (
    <section className="container-shell py-16 sm:py-20">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Order details</p>
      <h1 className="mt-3 text-[1.375rem] font-bold leading-[1.25] text-primary">{order.id}</h1>
      <p className="mt-2 text-sm text-muted">Placed on {formatDate(order.createdAt)}</p>

      <div className="mt-8 rounded-[28px] border border-primary/15 bg-ivory p-5">
        <p className="text-sm text-muted">Status</p>
        <p className="mt-2 capitalize text-primary">{order.orderStatus}</p>
        <p className="mt-1 text-sm text-muted">Payment: {order.paymentStatus}</p>
      </div>

      <div className="mt-6 rounded-[28px] border border-primary/15 bg-ivory p-5">
        <p className="text-sm text-muted">Items</p>
        <div className="mt-4 space-y-4">
          {order.items.map((item) => {
            const product = getProductById(item.productId);
            if (!product) {
              return null;
            }
            return (
              <div key={`${item.productId}-${item.size}`} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-primary">{product.name}</p>
                  <p className="text-muted">Fit {item.size} x {item.quantity}</p>
                </div>
                <span className="text-charcoal">{formatPrice(product.price * item.quantity)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-primary/15 bg-ivory p-5 text-sm text-muted">
        <p className="text-primary">{order.shipping.name}</p>
        <p className="mt-2">{order.shipping.address}</p>
        <p>{order.shipping.city} {order.shipping.pincode}</p>
        <p>{order.shipping.phone}</p>
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
