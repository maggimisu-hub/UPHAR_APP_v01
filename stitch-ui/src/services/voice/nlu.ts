/**
 * Deterministic NLU Intent and Entity Extractor for Uphar Voice Assistant
 * 
 * Adheres strictly to the Uphar Voice PRD v2.0 specification:
 * - Deterministic "show me / dikhao" precedence
 * - Disentangles cardinal "one" (quantity) from ordinal "first" (selection)
 * - Restricts VIEW_DETAILS to product-specific attributes
 */

import { ParsedVoiceCommand, VoiceEntitySet, VoiceIntentType } from "./types";
import { normalizeQuery, detectLanguage } from "./normalization";
import {
  CANONICAL_BRANDS,
  CANONICAL_CATEGORIES,
  ORDINAL_MAPPINGS,
  RELATIVE_MODIFIERS,
  DIRECT_PRONOUNS,
  OPEN_VERBS,
  DISPLAY_VERBS,
  PRICE_TRIGGERS,
  AVAILABILITY_TRIGGERS,
  DETAILS_TRIGGERS,
  CART_TRIGGERS,
  CONFIRM_TRIGGERS,
  CANCEL_TRIGGERS,
  PAGINATION_TRIGGERS,
  NEW_ARRIVALS_TRIGGERS,
} from "./lexicon";

function matchesAny(text: string, triggers: string[]): boolean {
  return triggers.some((t) => {
    // If trigger has multiple words, check substring with word boundary
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|\\b)${escaped}(\\b|$)`, "i").test(text);
  });
}

/**
 * Extracts entities: brand, category, ordinals, relative modifiers, pronouns, quantities.
 */
export function extractEntities(normQuery: string): VoiceEntitySet {
  const entities: VoiceEntitySet = {};

  // 1. Direct pronouns ("isko", "iska", "it", "this")
  if (matchesAny(normQuery, DIRECT_PRONOUNS)) {
    entities.isDirectReference = true;
  }

  // 2. Explicit open action
  if (matchesAny(normQuery, OPEN_VERBS)) {
    entities.explicitOpenAction = true;
  }

  // 3. Brand extraction
  for (const b of CANONICAL_BRANDS) {
    if (matchesAny(normQuery, [b.canonical.toLowerCase(), ...b.aliases])) {
      entities.brand = b.canonical;
      break;
    }
  }

  // 4. Category extraction
  for (const c of CANONICAL_CATEGORIES) {
    if (matchesAny(normQuery, [c.canonical.toLowerCase(), ...c.aliases])) {
      entities.category = c.canonical;
      break;
    }
  }

  // 5. Ordinal extraction vs Cardinal "one"
  // "First one", "1st", "pehla", "the first kajal" -> Ordinal
  for (const o of ORDINAL_MAPPINGS) {
    if (matchesAny(normQuery, o.phrases)) {
      entities.ordinalIndex = o.index;
      break;
    }
  }

  // Check for cardinal "one" vs ordinal "first"
  // If the query contains "one <category>" or "1 <category>" or "ek <category>"
  const cardinalOneRegex = /\b(one|1|ek)\s+([a-z]+)/i;
  const match = normQuery.match(cardinalOneRegex);
  if (match) {
    const wordAfter = match[2];
    const isCategory = CANONICAL_CATEGORIES.some(
      (c) => c.canonical.toLowerCase() === wordAfter || c.aliases.includes(wordAfter)
    );
    if (isCategory) {
      entities.quantity = 1;
      // Ensure ordinalIndex is NOT set if it was mistakenly captured
      delete entities.ordinalIndex;
    }
  }

  // 6. Relative modifiers ("wala", "wali", "wale", "one")
  for (const m of RELATIVE_MODIFIERS) {
    if (m === "one" && entities.quantity === 1) {
      continue;
    }
    if (new RegExp(`(^|\\b)${m}(\\b|$)`, "i").test(normQuery)) {
      entities.relativeModifier = m;
      break;
    }
  }

  // 7. Residual productTerm
  let residual = normQuery;
  if (entities.brand) {
    const bEntry = CANONICAL_BRANDS.find((b) => b.canonical === entities.brand);
    if (bEntry) {
      for (const a of [bEntry.canonical.toLowerCase(), ...bEntry.aliases]) {
        residual = residual.replace(new RegExp(`\\b${a}\\b`, "gi"), "");
      }
    }
  }
  if (entities.category) {
    const cEntry = CANONICAL_CATEGORIES.find((c) => c.canonical === entities.category);
    if (cEntry) {
      for (const a of [cEntry.canonical.toLowerCase(), ...cEntry.aliases]) {
        residual = residual.replace(new RegExp(`\\b${a}\\b`, "gi"), "");
      }
    }
  }
  residual = residual
    .replace(/\b(dikhao|show|kholo|open|chahiye|lena|hai|price|details|cart|wala|wali|first|second|one|1|ek|the|me|mein|daal|daalo|do|karo|ka|ki|ke|ko|se|please|batao)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (residual.length > 0) {
    entities.productTerm = residual;
  }

  return entities;
}

/**
 * Determines Intent using strict deterministic precedence rules:
 * 
 * 1. Cart addition ("cart mein daal do", "add to cart")
 * 2. Confirmation / Cancellation (Affirmative/Negative)
 * 3. Explicit OPEN verb ("kholo", "open karo", "page kholo")
 * 4. Contextual pronoun + "dikhao" ("isko dikhao" => OPEN_PRODUCT)
 * 5. Price check
 * 6. Availability check
 * 7. View details (product attributes only)
 * 8. Pagination ("aur dikhao")
 * 9. Ordinal or relative selection ("second one", "vlcc wala")
 * 10. Display / Need + Brand/Product ("vlcc kajal dikhao", "vlcc kajal") => SEARCH_PRODUCT
 * 11. Display / Need + Category ("kajal dikhao", "kajal") => SEARCH_CATEGORY
 * 12. Fallback => UNKNOWN
 */
export function classifyIntent(
  normQuery: string,
  entities: VoiceEntitySet,
  hasActiveContext: boolean = false
): { intent: VoiceIntentType; confidence: "HIGH" | "MEDIUM" | "LOW" } {
  // 1. Cart addition ("Cart mein daal do", "add to cart")
  if (matchesAny(normQuery, CART_TRIGGERS)) {
    return { intent: "ADD_TO_CART", confidence: "HIGH" };
  }

  // 2. Confirm ("Haan daal do", "Yes", "Confirm")
  if (matchesAny(normQuery, CONFIRM_TRIGGERS) && !entities.category && !entities.brand) {
    return { intent: "CONFIRM", confidence: "HIGH" };
  }

  // 3. Cancel
  if (matchesAny(normQuery, CANCEL_TRIGGERS) && !entities.category && !entities.brand) {
    return { intent: "CANCEL", confidence: "HIGH" };
  }

  // 4. More results / pagination
  if (matchesAny(normQuery, PAGINATION_TRIGGERS)) {
    return { intent: "MORE_RESULTS", confidence: "HIGH" };
  }

  // 4b. New arrivals discovery ("Show me new arrivals", "What's new", "Naye products dikhao")
  if (matchesAny(normQuery, NEW_ARRIVALS_TRIGGERS) && !entities.category && !entities.brand) {
    return { intent: "NEW_ARRIVALS", confidence: "HIGH" };
  }

  // 5. Price inquiry
  if (matchesAny(normQuery, PRICE_TRIGGERS)) {
    return { intent: "CHECK_PRICE", confidence: "HIGH" };
  }

  // 6. Availability inquiry
  if (matchesAny(normQuery, AVAILABILITY_TRIGGERS)) {
    return { intent: "CHECK_AVAILABILITY", confidence: "HIGH" };
  }

  // 7. View details (Product attributes only)
  if (matchesAny(normQuery, DETAILS_TRIGGERS)) {
    // Exclude return policy / shipping questions
    const isPolicyQuestion = /\b(return|refund|exchange|shipping|delivery|payment|cod)\b/i.test(normQuery);
    if (!isPolicyQuestion) {
      return { intent: "VIEW_DETAILS", confidence: "HIGH" };
    }
  }

  // 8. Explicit OPEN verbs
  if (entities.explicitOpenAction) {
    return { intent: "OPEN_PRODUCT", confidence: "HIGH" };
  }

  // 9. Contextual display pronoun: "Isko dikhao", "Yeh dikhao", "Show this"
  // When an activeProduct exists, "isko dikhao" directs focus to open it
  if (entities.isDirectReference && matchesAny(normQuery, DISPLAY_VERBS)) {
    return { intent: "OPEN_PRODUCT", confidence: "HIGH" };
  }

  // 10. Ordinal selection: "first one", "second", "show me the first kajal"
  if (entities.ordinalIndex !== undefined) {
    return { intent: "SELECT_PRODUCT", confidence: "HIGH" };
  }

  // 11. Relative modifier selection: "VLCC wala" (without explicit open verb)
  if (entities.relativeModifier && (entities.brand || entities.productTerm)) {
    return { intent: "SELECT_PRODUCT", confidence: "HIGH" };
  }

  // 12. SEARCH_PRODUCT: Specific Brand + Category, or Brand query
  // "VLCC Kajal dikhao", "VLCC Kajal", "VLCC Kajal chahiye"
  if (entities.brand && (entities.category || entities.productTerm)) {
    return { intent: "SEARCH_PRODUCT", confidence: "HIGH" };
  }

  // Brand-only query e.g. "Mamaearth products", "VLCC"
  if (entities.brand) {
    return { intent: "SEARCH_PRODUCT", confidence: "HIGH" };
  }

  // 13. SEARCH_CATEGORY: Category queries
  // "Kajal dikhao", "Kajal", "Show me bangles", "Show me one kajal"
  if (entities.category) {
    return { intent: "SEARCH_CATEGORY", confidence: "HIGH" };
  }

  // 14. Bare display verbs or unknown tokens
  if (matchesAny(normQuery, DISPLAY_VERBS)) {
    return { intent: "UNKNOWN", confidence: "LOW" };
  }

  return { intent: "UNKNOWN", confidence: "LOW" };
}

/**
 * Main NLU parsing pipeline.
 */
export function parseVoiceCommand(
  rawQuery: string,
  hasActiveContext: boolean = false
): ParsedVoiceCommand {
  const normalizedQuery = normalizeQuery(rawQuery);
  const entities = extractEntities(normalizedQuery);
  const language = detectLanguage(rawQuery);
  const { intent, confidence } = classifyIntent(normalizedQuery, entities, hasActiveContext);

  return {
    rawQuery,
    normalizedQuery,
    intent,
    entities,
    confidence,
    language,
  };
}
