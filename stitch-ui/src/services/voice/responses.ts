/**
 * Multilingual Response Formatter for Uphar Voice Assistant
 * 
 * Generates concise, natural spoken text and rich UI messages in English,
 * Hindi, and Hinglish. Adheres strictly to the PRD v2.0 response contract.
 */

import { Product } from "../../types";
import { formatPrice } from "../../lib/format";
import { getProductTotalStock } from "./catalogIndex";

export function formatPriceText(product: Product, lang: "en" | "hi" | "hinglish"): string {
  const price = formatPrice(product.price);
  const mrp = product.mrpPrice ? formatPrice(product.mrpPrice) : null;
  const discount = product.discount_percent ? `${product.discount_percent}% off` : null;

  if (mrp && discount) {
    if (lang === "hi") {
      return `${product.name} का दाम ${price} है, एमआरपी ${mrp} पर ${discount}।`;
    }
    return `${product.name} is ${price} (${discount} MRP of ${mrp}).`;
  }

  if (lang === "hi") {
    return `${product.name} का दाम ${price} है।`;
  }
  return `${product.name} is available for ${price}.`;
}

export function formatAvailabilityText(product: Product, lang: "en" | "hi" | "hinglish"): string {
  const stock = getProductTotalStock(product);
  const inStock = stock > 0;

  if (inStock) {
    if (lang === "hi") {
      return `हाँ, ${product.name} स्टॉक में उपलब्ध है।`;
    }
    return `Yes, ${product.name} is in stock.`;
  }

  if (lang === "hi") {
    return `माफ़ कीजिए, ${product.name} अभी आउट ऑफ स्टॉक है।`;
  }
  return `Sorry, ${product.name} is currently out of stock.`;
}

export function formatProductDetailsText(product: Product, lang: "en" | "hi" | "hinglish"): string {
  const desc = product.description?.trim() || "Quality product from Uphar collection.";
  // Strict PRD contract: VIEW_DETAILS is product attributes only, never return policy
  if (lang === "hi") {
    return `${product.name}: ${desc}`;
  }
  return `${product.name}: ${desc}`;
}

export function formatCandidatesSummaryText(
  candidates: Product[],
  categoryOrBrand: string | undefined,
  lang: "en" | "hi" | "hinglish"
): string {
  const count = candidates.length;
  const names = candidates.slice(0, 3).map((p) => p.name).join(", ");

  if (lang === "hi") {
    return `मुझे ${count} प्रोडक्ट्स मिले हैं: ${names}। आप इनमें से किसी को चुन सकते हैं या ओपन करने को कह सकते हैं।`;
  }
  return `Here are the matching options: ${names}. Which one would you like to explore?`;
}

export function formatUncarriedBrandWithAlternatives(
  brand: string,
  category: string | undefined,
  alternatives: Product[],
  lang: "en" | "hi" | "hinglish"
): string {
  if (alternatives.length > 0) {
    const altNames = alternatives.map((a) => a.name).join(" and ");
    if (lang === "hi") {
      return `हमारे पास ${brand} ${category || "प्रोडक्ट"} उपलब्ध नहीं है। लेकिन हमारे पास ${altNames} उपलब्ध हैं। क्या आप इनका दाम देखना चाहेंगे?`;
    }
    return `We do not carry ${brand} ${category || "products"}. We have options from ${altNames}. Would you like to see their prices?`;
  }

  if (lang === "hi") {
    return `माफ़ कीजिए, हमारे पास ${brand} के प्रोडक्ट्स उपलब्ध नहीं हैं।`;
  }
  return `Sorry, we do not carry ${brand} products in our catalog.`;
}

export function formatAddToCartPrompt(product: Product, lang: "en" | "hi" | "hinglish"): string {
  const price = formatPrice(product.price);
  if (lang === "hi") {
    return `क्या आप ${product.name} को ${price} में कार्ट में डालना चाहते हैं? हाँ या ना कहें।`;
  }
  return `Would you like to add ${product.name} to your cart for ${price}? Say 'Yes' to confirm or 'Cancel'.`;
}

export function formatCartCommittedText(product: Product, lang: "en" | "hi" | "hinglish"): string {
  if (lang === "hi") {
    return `हाँ, ${product.name} को आपके कार्ट में डाल दिया गया है।`;
  }
  return `${product.name} has been added to your cart.`;
}

export function formatCartCancelledText(product: Product, lang: "en" | "hi" | "hinglish"): string {
  if (lang === "hi") {
    return `${product.name} को कार्ट में जोड़ना रद्द कर दिया गया है।`;
  }
  return `Cancelled adding ${product.name} to cart.`;
}

export function formatOpenProductText(product: Product, lang: "en" | "hi" | "hinglish"): string {
  if (lang === "hi") {
    return `${product.name} का पेज खोला जा रहा है।`;
  }
  return `Opening ${product.name}...`;
}
