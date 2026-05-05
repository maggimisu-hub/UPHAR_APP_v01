import type { ProductType } from "../types";

type ProductTypeCopy = {
  selectorHeading: string;
  lineItemLabel: string;
  relatedEyebrow: string;
  relatedTitle: string;
  relatedBody: string;
  variantPlaceholder: string;
};

const PRODUCT_TYPE_COPY: Record<ProductType, ProductTypeCopy> = {
  jewellery: {
    selectorHeading: "Option",
    lineItemLabel: "Option",
    relatedEyebrow: "Related Jewellery",
    relatedTitle: "Complete the set.",
    relatedBody: "Related jewellery selected to complement this piece.",
    variantPlaceholder: "Standard, Rose Gold, Gold Tone, Necklace Set",
  },
  bangles: {
    selectorHeading: "Bangle size / Fit guide",
    lineItemLabel: "Size",
    relatedEyebrow: "Related Bangles",
    relatedTitle: "Complete the stack.",
    relatedBody: "Related bangles selected to complement this piece.",
    variantPlaceholder: "2.4, 2.6, 2.8",
  },
  cosmetics: {
    selectorHeading: "Size / Quantity",
    lineItemLabel: "Quantity",
    relatedEyebrow: "Related Cosmetics",
    relatedTitle: "Complete your routine.",
    relatedBody: "Related cosmetics selected to complement this product.",
    variantPlaceholder: "60 ml, 100 ml, Pack of 2, Set of 3, 1 pc",
  },
};

export function getProductTypeCopy(productType: ProductType): ProductTypeCopy {
  return PRODUCT_TYPE_COPY[productType];
}
