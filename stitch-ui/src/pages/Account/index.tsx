import { Link } from "react-router-dom";

import Button from "../../components/Button";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";
import { formatDate, formatPrice } from "../../lib/format";

export default function Account() {
  const { orders, wishlistCount, cartCount } = useStore();

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionTitle
        eyebrow="Account"
        title="Your Uphar account."
        body="Review jewellery orders, payment updates, and saved pieces in one calm, minimal dashboard."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[32px] border border-primary/15 bg-ivory p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Profile</p>
          <h2 className="mt-4 text-[1.375rem] font-bold leading-[1.25] text-primary">Client dashboard</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
            <p>Keep track of bridal orders, festive purchases, and delivery details for upcoming occasions.</p>
            <p>Your current experience is saved locally, with the interface structured to connect to a real account system later.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 text-center text-sm">
            <div className="rounded-[20px] bg-background-light p-4">
              <p className="text-2xl text-primary">{orders.length}</p>
              <p className="mt-1 text-muted">Orders</p>
            </div>
            <div className="rounded-[20px] bg-background-light p-4">
              <p className="text-2xl text-primary">{wishlistCount + cartCount}</p>
              <p className="mt-1 text-muted">Saved pieces</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link to="/wishlist" className="rounded-[20px] border border-primary/15 bg-background-light px-4 py-4 text-sm font-medium text-primary transition duration-300 hover:border-accent">
              Saved pieces
            </Link>
            <Link to="/addresses" className="rounded-[20px] border border-primary/15 bg-background-light px-4 py-4 text-sm font-medium text-primary transition duration-300 hover:border-accent">
              Address book
            </Link>
            <Link to="/stylist" className="rounded-[20px] border border-primary/15 bg-background-light px-4 py-4 text-sm font-medium text-primary transition duration-300 hover:border-accent">
              Jewellery concierge
            </Link>
            <Link to="/try-on" className="rounded-[20px] border border-primary/15 bg-background-light px-4 py-4 text-sm font-medium text-primary transition duration-300 hover:border-accent">
              Virtual preview
            </Link>
          </div>
          <Button href="/shop" className="mt-8">
            Shop collection
          </Button>
        </div>

        <div className="space-y-5">
          {orders.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-primary/20 bg-ivory p-8 text-center">
              <h3 className="text-[1.375rem] font-bold leading-[1.25] text-primary">No orders yet.</h3>
              <p className="mt-3 text-sm leading-7 text-muted">Place an Uphar order to see confirmation and payment updates here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <Link key={order.id} to={`/order/${order.id}`} className="block rounded-[32px] border border-primary/15 bg-ivory p-6 transition duration-300 hover:border-accent sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-muted">{order.id}</p>
                    <h3 className="mt-3 text-[18px] font-semibold leading-[1.3] text-primary">Order placed {formatDate(order.createdAt)}</h3>
                  </div>
                  <div className="text-right text-sm text-muted">
                    <p>Order: <span className="text-primary">{order.orderStatus}</span></p>
                    <p className="mt-1">Payment: <span className="text-primary">{order.paymentStatus}</span></p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-primary/15 pt-6 text-sm">
                  <span className="text-muted">Shipping to {order.shipping.city}</span>
                  <span className="font-medium text-primary">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
