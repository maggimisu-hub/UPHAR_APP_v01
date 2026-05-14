import { formatPrice } from "../lib/format";
import { getPricingDetails } from "../lib/pricing";

type PriceDisplayProps = {
  price: number;
  mrpPrice?: number | null;
  discountPercent?: number | null;
  size?: "card" | "detail" | "compact";
  showSavings?: boolean;
};

export default function PriceDisplay({
  price,
  mrpPrice,
  discountPercent,
  size = "card",
  showSavings = false,
}: PriceDisplayProps) {
  const pricing = getPricingDetails(price, mrpPrice, discountPercent);
  const finalPriceClass =
    size === "detail"
      ? "text-[1.75rem] font-bold text-primary"
      : size === "compact"
        ? "text-sm font-semibold text-primary"
        : "text-base font-bold text-primary";

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={finalPriceClass}>{formatPrice(price)}</span>
        {pricing.hasDiscount && (
          <>
            {pricing.mrpPrice && (
              <span className="text-sm text-muted">
                MRP <span className="line-through">{formatPrice(pricing.mrpPrice)}</span>
              </span>
            )}
            <span className="rounded-sm bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              {pricing.discountPercent}% OFF
            </span>
          </>
        )}
      </div>
      {showSavings && pricing.hasDiscount && pricing.mrpPrice && (
        <p className="text-sm text-accent">
          You save {formatPrice(pricing.savings)} ({pricing.discountPercent}% OFF)
        </p>
      )}
    </div>
  );
}
