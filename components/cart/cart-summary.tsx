import { Button } from "@/components/forms/button";
import { formatPrice } from "@/lib/utils";

type CartSummaryProps = {
  subtotal: number;
};

export function CartSummary({ subtotal }: CartSummaryProps) {
  return (
    <aside className="rounded-[32px] border border-sand bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-stone">Order Summary</p>
      <div className="mt-8 space-y-4 text-sm text-stone">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="text-ink">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span className="text-ink">Complimentary</span>
        </div>
        <div className="flex items-center justify-between border-t border-sand pt-4 text-base">
          <span className="text-ink">Total</span>
          <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
        </div>
      </div>
      <Button href="/checkout" className="mt-8 w-full" size="lg">
        Continue to checkout
      </Button>
      <p className="mt-4 text-sm leading-7 text-stone">Structured for future integration with real taxes, shipping providers, and payment processors.</p>
    </aside>
  );
}

