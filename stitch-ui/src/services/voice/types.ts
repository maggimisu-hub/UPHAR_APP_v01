import { Product } from "../../types";

export type VoiceIntentType =
  | "SEARCH_PRODUCT"       // Exact product/brand query: "VLCC Kajal", "The Derma Co Serum"
  | "SEARCH_CATEGORY"      // Category discovery query: "Kajal", "Show me bangles", "Serums"
  | "CHECK_PRICE"          // Price inquiry: "What is the price?", "Kitne ka hai?"
  | "CHECK_AVAILABILITY"   // Stock inquiry: "Is it in stock?", "VLCC Kajal hai kya?"
  | "VIEW_DETAILS"         // Product attribute details: "Iske details batao", "What are the details?"
  | "OPEN_PRODUCT"         // Direct route navigation: "Isko open karo", "VLCC Kajal ka page kholo"
  | "SELECT_PRODUCT"       // Candidate selection: "First one", "VLCC wala", "Second"
  | "MORE_RESULTS"         // Pagination over candidate pool: "Aur dikhao", "Show more", "Next"
  | "ADD_TO_CART"          // Cart commitment: "Add to cart", "Cart mein daal do"
  | "CONFIRM"              // Two-step confirmation affirmative: "Yes", "Haan", "Confirm"
  | "CANCEL"               // Two-step confirmation negative: "No", "Nahi", "Cancel"
  | "UNKNOWN";             // Unclassifiable or ambiguous utterance

export interface VoiceEntitySet {
  brand?: string;                  // Canonical brand: "VLCC", "Mamaearth", "The Derma Co", "Dot & Key"
  category?: string;               // Canonical category: "Kajal", "Serum", "Bangles", "Jhumka", "Shower Gel"
  productTerm?: string;            // Clean residual query tokens
  ordinalIndex?: number;           // 0-indexed rank (0 = first, 1 = second, etc.)
  relativeModifier?: string;       // "wala", "wali", "wale"
  priceMax?: number;               // Numeric upper bound
  priceMin?: number;               // Numeric lower bound
  isDirectReference?: boolean;     // Pronouns: "it", "this", "isko", "iska"
  explicitOpenAction?: boolean;    // True if utterance contains open/kholo verbs
  quantity?: number;               // Cardinal quantity: 1, 2, etc.
}

export interface ParsedVoiceCommand {
  rawQuery: string;
  normalizedQuery: string;
  intent: VoiceIntentType;
  entities: VoiceEntitySet;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  language: "en" | "hi" | "hinglish";
}

export interface PendingCartAction {
  product: Product;
  variantName?: string;
  price: number;
  timestamp: number;
}

export interface ConversationContext {
  activeProduct?: Product;                 // Currently focused product object
  candidateProducts?: Product[];           // List of active candidates (max 3 per page)
  candidateCategory?: string;              // Active category context
  candidateBrand?: string;                 // Active brand context
  pendingConfirmation?: PendingCartAction; // Active cart confirmation state
  lastIntent?: VoiceIntentType;
  paginationOffset: number;                // Window offset for "aur dikhao"
  timestamp: number;                       // Epoch timestamp
}

export interface VoiceActionResult {
  action:
    | "NONE"
    | "DISPLAY_PRODUCTS"
    | "NAVIGATE_PAGE"
    | "PROMPT_CONFIRMATION"
    | "COMMITTED_CART"
    | "SPEAK_INFO";
  intent: VoiceIntentType;
  matchedProduct?: Product;
  candidateProducts?: Product[];
  message: string;
  spokenText: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  requiresConfirmation?: boolean;
}
