export type PricingDetails = {
  hasDiscount: boolean;
  salePrice: number;
  mrpPrice: number | null;
  savings: number;
  discountPercent: number;
};

/**
 * Calculates pricing details.
 * If explicitDiscountPercent is provided, it's used for the badge.
 * mrpPrice is the original price before discount.
 * salePrice is the final price the customer pays.
 */
export function getPricingDetails(
  salePrice: number,
  mrpPrice?: number | null,
  explicitDiscountPercent?: number | null,
): PricingDetails {
  const normalizedMrp =
    typeof mrpPrice === "number" && mrpPrice > salePrice ? mrpPrice : null;
  
  const savings = normalizedMrp ? normalizedMrp - salePrice : 0;
  
  // Use explicit discount percent from DB if available, otherwise calculate it
  let discountPercent = 0;
  if (typeof explicitDiscountPercent === "number" && explicitDiscountPercent > 0) {
    discountPercent = explicitDiscountPercent;
  } else if (normalizedMrp && normalizedMrp > 0) {
    discountPercent = Math.round((savings / normalizedMrp) * 100);
  }

  return {
    hasDiscount: Boolean(normalizedMrp) || discountPercent > 0,
    salePrice,
    mrpPrice: normalizedMrp,
    savings,
    discountPercent,
  };
}
