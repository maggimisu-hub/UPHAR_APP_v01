import Button from "../../components/Button";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";
import { formatPrice } from "../../lib/format";

export default function Cart() {
  const { cartDetailed, cartSubtotal, cart, productsLoading, removeFromCart, updateCartQuantity, lastAdjustmentMessage } = useStore();

  if (productsLoading && cart.length > 0) {
    return (
      <section className="container-shell py-16 sm:py-20">
        <div className="rounded-[32px] border border-dashed border-primary/20 bg-ivory p-8 text-center sm:p-12">
          <p className="text-[1.375rem] font-bold leading-[1.25] text-primary">Loading your selection...</p>
        </div>
      </section>
    );
  }

  if (cartDetailed.length === 0) {
    return (
      <section className="container-shell py-16 sm:py-20">
        <div className="rounded-[32px] border border-dashed border-primary/20 bg-ivory p-8 text-center sm:p-12">
          <h2 className="text-[1.375rem] font-bold leading-[1.25] text-primary">Your cart is empty.</h2>
          <p className="mt-4 text-sm leading-7 text-muted">Browse the Uphar collection and add the pieces you would like to reserve for checkout.</p>
          <div className="mt-8">
            <Button href="/shop">Shop collection</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionTitle
        eyebrow="Cart"
        title="Review your selected jewellery."
        body="Adjust quantities, remove pieces, and continue when your order feels complete."
      />

      {lastAdjustmentMessage && (
        <div className="mt-8 rounded-[20px] bg-accent/10 p-4 text-center text-sm font-medium text-accent">
          {lastAdjustmentMessage}
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {cartDetailed.map((line) => (
            <div key={`${line.product.id}-${line.size}`} className="grid gap-4 rounded-[28px] border border-primary/15 bg-ivory p-4 md:grid-cols-[160px_1fr] md:p-6">
              <div className="overflow-hidden rounded-[24px] bg-background-light">
                <img src={line.product.images[0]} alt={line.product.name} className="aspect-[4/5] w-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[18px] font-semibold leading-[1.3] text-primary">{line.product.name}</h3>
                      <p className="mt-1 text-sm text-muted">Fit {line.size}</p>
                    </div>
                    <p className="text-sm text-primary">{formatPrice(line.lineTotal)}</p>
                  </div>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-muted">{line.product.description}</p>
                  
                  {!line.product.is_returnable && (
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/5 inline-block px-2 py-0.5 rounded-sm">
                      Non-returnable item
                    </p>
                  )}
                  
                  {line.quantity > line.availableStock && (
                    <p className="mt-2 text-sm font-semibold text-primary">Insufficient stock. Please reduce quantity.</p>
                  )}
                  {line.availableStock <= 3 && line.availableStock > 0 && (
                    <p className="mt-2 text-sm font-medium text-accent">Only {line.availableStock} left in stock.</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-sm border border-primary/15 bg-background-light p-1">
                    <button onClick={() => updateCartQuantity(line.product.id, line.size, line.quantity - 1)} className="h-10 w-10 rounded-sm text-lg text-primary transition hover:text-accent">
                      -
                    </button>
                    <span className="min-w-12 text-center text-sm text-primary">{line.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(line.product.id, line.size, line.quantity + 1)} 
                      disabled={line.quantity >= line.availableStock}
                      className="h-10 w-10 disabled:opacity-30 rounded-sm text-lg text-primary transition hover:text-accent"
                    >
                      +
                    </button>
                  </div>
                  <Button variant="ghost" className="justify-start px-0" onClick={() => removeFromCart(line.product.id, line.size)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-[32px] border border-primary/15 bg-ivory p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Order Summary</p>
          <div className="mt-8 space-y-4 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="text-primary">{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span className="text-primary">Complimentary</span>
            </div>
            <div className="flex items-center justify-between border-t border-primary/15 pt-4 text-base">
              <span className="text-primary">Total</span>
              <span className="font-medium text-primary">{formatPrice(cartSubtotal)}</span>
            </div>
          </div>
          <Button href="/checkout" className="mt-8 w-full">
            Continue to checkout
          </Button>
        </aside>
      </div>
    </section>
  );
}
