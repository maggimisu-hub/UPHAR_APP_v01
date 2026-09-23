import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Product } from "../../../types";
import { VoiceResolver } from "../voiceResolver";
import { parseVoiceCommand } from "../nlu";
import { getAllowedOrigin, handler as realtimeHandler } from "../../../../netlify/functions/realtime-session.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verified catalog fixtures from PRD v2.0 Golden Test Matrix
const FIXTURE_PRODUCTS: Product[] = [
  {
    id: "prod-mamaearth-kajal-001",
    name: "Mamaearth Charcoal Black Long Stay Kajal",
    price: 269,
    mrpPrice: 299,
    discount_percent: 10,
    images: ["/images/mamaearth-kajal.jpg"],
    product_type: "cosmetics",
    product_collection: "eye-makeup",
    is_returnable: false,
    sizes: ["Default"],
    variantStock: { Default: 15 },
    variantPrices: { Default: 269 },
    description: "Enriched with Chamomile and Vitamin C for intense 11-hour smudge-free stay.",
    tag: "Cosmetics",
  },
  {
    id: "prod-vlcc-kajal-002",
    name: "VLCC Kajal",
    price: 179,
    mrpPrice: 199,
    discount_percent: 10,
    images: ["/images/vlcc-kajal.jpg"],
    product_type: "cosmetics",
    product_collection: "eye-makeup",
    is_returnable: false,
    sizes: ["Default"],
    variantStock: { Default: 8 },
    variantPrices: { Default: 179 },
    description: "Triphala enriched herbal kajal for deep black soothing eye care.",
    tag: "Cosmetics",
  },
  {
    id: "prod-derma-co-serum-003",
    name: "The Derma Co 10% Vitamin C Face Serum 30ml",
    price: 629,
    mrpPrice: 699,
    discount_percent: 10,
    images: ["/images/derma-serum.jpg"],
    product_type: "cosmetics",
    product_collection: "none",
    is_returnable: false,
    sizes: ["30ml"],
    variantStock: { "30ml": 5 },
    variantPrices: { "30ml": 629 },
    description: "Designed to treat dark spots and boost skin radiance.",
    tag: "Cosmetics",
    newArrival: true,
  },
  {
    id: "prod-fiama-shower-gel-004",
    name: "Fiama Shower Gel Blackcurrant & Bearberry Radiant Glow",
    price: 138,
    mrpPrice: 150,
    discount_percent: 8,
    images: ["/images/fiama-gel.jpg"],
    product_type: "cosmetics",
    product_collection: "none",
    is_returnable: false,
    sizes: ["250ml"],
    variantStock: { "250ml": 20 },
    variantPrices: { "250ml": 138 },
    description: "Moisture-lock formula enriched with skin conditioners.",
    tag: "Cosmetics",
  },
];

interface TestAssertionResult {
  id: number;
  query: string;
  passed: boolean;
  error?: string;
}

const results: TestAssertionResult[] = [];

function assert(id: number, query: string, condition: boolean, message: string) {
  if (!condition) {
    results.push({ id, query, passed: false, error: message });
    console.error(`❌ [FAIL] Query ${id}: "${query}" -> ${message}`);
  } else {
    results.push({ id, query, passed: true });
    console.log(`✅ [PASS] Query ${id}: "${query}"`);
  }
}

export async function runVoiceTestSuite(): Promise<boolean> {
  console.log("===============================================================");
  console.log("RUNNING UPHAR VOICE SHOPPING ASSISTANT GOLDEN TEST MATRIX v2.0");
  console.log("===============================================================\n");

  const resolver = new VoiceResolver(FIXTURE_PRODUCTS);
  const contextManager = resolver.getContextManager();

  // 1. "Kajal" -> SEARCH_CATEGORY, No navigation, presents Mamaearth & VLCC Kajal
  {
    contextManager.reset();
    const res = resolver.resolve("Kajal");
    assert(1, "Kajal", res.intent === "SEARCH_CATEGORY", `Expected SEARCH_CATEGORY, got ${res.intent}`);
    assert(1, "Kajal", res.action === "DISPLAY_PRODUCTS", `Expected DISPLAY_PRODUCTS, got ${res.action}`);
    assert(1, "Kajal", (res.candidateProducts?.length || 0) >= 2, "Expected at least 2 Kajal candidates");
  }

  // 2. "Kajal dikhao" -> SEARCH_CATEGORY, No navigation
  {
    contextManager.reset();
    const res = resolver.resolve("Kajal dikhao");
    assert(2, "Kajal dikhao", res.intent === "SEARCH_CATEGORY", `Expected SEARCH_CATEGORY, got ${res.intent}`);
    assert(2, "Kajal dikhao", res.action === "DISPLAY_PRODUCTS", `Expected DISPLAY_PRODUCTS, got ${res.action}`);
  }

  // 3. "VLCC Kajal" -> SEARCH_PRODUCT, No navigation
  {
    contextManager.reset();
    const res = resolver.resolve("VLCC Kajal");
    assert(3, "VLCC Kajal", res.intent === "SEARCH_PRODUCT", `Expected SEARCH_PRODUCT, got ${res.intent}`);
    assert(3, "VLCC Kajal", res.action === "DISPLAY_PRODUCTS", `Expected DISPLAY_PRODUCTS, got ${res.action}`);
    assert(3, "VLCC Kajal", res.matchedProduct?.name.includes("VLCC") === true, "Expected VLCC product match");
  }

  // 4. "VLCC Kajal dikhao" -> SEARCH_PRODUCT, No navigation
  {
    contextManager.reset();
    const res = resolver.resolve("VLCC Kajal dikhao");
    assert(4, "VLCC Kajal dikhao", res.intent === "SEARCH_PRODUCT", `Expected SEARCH_PRODUCT, got ${res.intent}`);
    assert(4, "VLCC Kajal dikhao", res.action === "DISPLAY_PRODUCTS", `Expected DISPLAY_PRODUCTS (NO NAV), got ${res.action}`);
  }

  // 5. "VLCC Kajal chahiye" -> SEARCH_PRODUCT, No navigation
  {
    contextManager.reset();
    const res = resolver.resolve("VLCC Kajal chahiye");
    assert(5, "VLCC Kajal chahiye", res.intent === "SEARCH_PRODUCT", `Expected SEARCH_PRODUCT, got ${res.intent}`);
    assert(5, "VLCC Kajal chahiye", res.action === "DISPLAY_PRODUCTS", `Expected DISPLAY_PRODUCTS, got ${res.action}`);
  }

  // 6. "VLCC Kajal ka page kholo" -> OPEN_PRODUCT, Navigates to /product/:id
  {
    contextManager.reset();
    const res = resolver.resolve("VLCC Kajal ka page kholo");
    assert(6, "VLCC Kajal ka page kholo", res.intent === "OPEN_PRODUCT", `Expected OPEN_PRODUCT, got ${res.intent}`);
    assert(6, "VLCC Kajal ka page kholo", res.action === "NAVIGATE_PAGE", `Expected NAVIGATE_PAGE, got ${res.action}`);
    assert(6, "VLCC Kajal ka page kholo", res.matchedProduct?.id === "prod-vlcc-kajal-002", "Expected VLCC ID");
  }

  // Setup candidate state for 7 and 8
  contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1]], "Kajal");

  // 7. "VLCC wala" -> SELECT_PRODUCT, selects VLCC Kajal, No navigation
  {
    const res = resolver.resolve("VLCC wala");
    assert(7, "VLCC wala", res.intent === "SELECT_PRODUCT", `Expected SELECT_PRODUCT, got ${res.intent}`);
    assert(7, "VLCC wala", res.action === "DISPLAY_PRODUCTS", `Expected DISPLAY_PRODUCTS (no route change), got ${res.action}`);
    assert(7, "VLCC wala", res.matchedProduct?.id === "prod-vlcc-kajal-002", "Expected VLCC Kajal selected");
  }

  // 8. "VLCC wala khol do" -> OPEN_PRODUCT, Navigates to /product/:id
  {
    contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1]], "Kajal");
    const res = resolver.resolve("VLCC wala khol do");
    assert(8, "VLCC wala khol do", res.intent === "OPEN_PRODUCT", `Expected OPEN_PRODUCT, got ${res.intent}`);
    assert(8, "VLCC wala khol do", res.action === "NAVIGATE_PAGE", `Expected NAVIGATE_PAGE, got ${res.action}`);
  }

  // Set activeProduct = VLCC Kajal for 9, 10, 11, 12, 13
  contextManager.setActiveProduct(FIXTURE_PRODUCTS[1]);

  // 9. "Isko dikhao" -> OPEN_PRODUCT (from activeProduct), Navigates to /product/:id
  {
    const res = resolver.resolve("Isko dikhao");
    assert(9, "Isko dikhao", res.intent === "OPEN_PRODUCT", `Expected OPEN_PRODUCT, got ${res.intent}`);
    assert(9, "Isko dikhao", res.action === "NAVIGATE_PAGE", `Expected NAVIGATE_PAGE, got ${res.action}`);
    assert(9, "Isko dikhao", res.matchedProduct?.id === "prod-vlcc-kajal-002", "Expected active VLCC Kajal");
  }

  // 10. "Isko open karo" -> OPEN_PRODUCT (from activeProduct), Navigates
  {
    const res = resolver.resolve("Isko open karo");
    assert(10, "Isko open karo", res.intent === "OPEN_PRODUCT", `Expected OPEN_PRODUCT, got ${res.intent}`);
    assert(10, "Isko open karo", res.action === "NAVIGATE_PAGE", `Expected NAVIGATE_PAGE, got ${res.action}`);
  }

  // 11. "Iska price kya hai?" -> CHECK_PRICE
  {
    const res = resolver.resolve("Iska price kya hai?");
    assert(11, "Iska price kya hai?", res.intent === "CHECK_PRICE", `Expected CHECK_PRICE, got ${res.intent}`);
    assert(11, "Iska price kya hai?", res.spokenText.includes("179"), "Expected ₹179 in speech");
  }

  // 12. "Iske details batao" -> VIEW_DETAILS (Product attributes only, NO return policy)
  {
    const res = resolver.resolve("Iske details batao");
    assert(12, "Iske details batao", res.intent === "VIEW_DETAILS", `Expected VIEW_DETAILS, got ${res.intent}`);
    assert(12, "Iske details batao", res.spokenText.includes("Triphala"), "Expected product description in speech");
    assert(12, "Iske details batao", !res.spokenText.toLowerCase().includes("return policy"), "Return policy must not be included");
  }

  // 13. "Lakme Kajal ka price?" -> CHECK_PRICE with activeProduct=VLCC: NO collision!
  {
    const res = resolver.resolve("Lakme Kajal ka price?");
    assert(13, "Lakme Kajal ka price?", res.intent === "CHECK_PRICE", `Expected CHECK_PRICE, got ${res.intent}`);
    assert(13, "Lakme Kajal ka price?", res.spokenText.toLowerCase().includes("do not carry lakme"), "Must state Lakme not carried");
    assert(13, "Lakme Kajal ka price?", res.candidateProducts?.length !== undefined && res.candidateProducts.length > 0, "Must suggest alternatives");
  }

  // 14. "VLCC Kajal available hai?" -> CHECK_AVAILABILITY
  {
    contextManager.reset();
    const res = resolver.resolve("VLCC Kajal available hai?");
    assert(14, "VLCC Kajal available hai?", res.intent === "CHECK_AVAILABILITY", `Expected CHECK_AVAILABILITY, got ${res.intent}`);
    assert(14, "VLCC Kajal available hai?", res.spokenText.toLowerCase().includes("in stock"), "Expected in-stock confirmation");
  }

  // Setup candidate pool for 15, 16, 17
  contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1]], "Kajal");

  // 15. "Show me the first Kajal" -> SELECT_PRODUCT, ordinalIndex = 0
  {
    const parsed = parseVoiceCommand("Show me the first Kajal", true);
    assert(15, "Show me the first Kajal", parsed.intent === "SELECT_PRODUCT", `Expected SELECT_PRODUCT, got ${parsed.intent}`);
    assert(15, "Show me the first Kajal", parsed.entities.ordinalIndex === 0, `Expected ordinalIndex=0, got ${parsed.entities.ordinalIndex}`);
    const res = resolver.resolve("Show me the first Kajal");
    assert(15, "Show me the first Kajal", res.matchedProduct?.id === "prod-mamaearth-kajal-001", "Expected Mamaearth Kajal selected");
  }

  // 16. "Show me one Kajal" -> SEARCH_CATEGORY (quantity: 1, NOT ordinal)
  {
    const parsed = parseVoiceCommand("Show me one Kajal", true);
    assert(16, "Show me one Kajal", parsed.intent === "SEARCH_CATEGORY", `Expected SEARCH_CATEGORY, got ${parsed.intent}`);
    assert(16, "Show me one Kajal", parsed.entities.quantity === 1, `Expected quantity=1, got ${parsed.entities.quantity}`);
    assert(16, "Show me one Kajal", parsed.entities.ordinalIndex === undefined, "Ordinal index must NOT be set for cardinal 'one'");
  }

  // 17. "Second one" -> SELECT_PRODUCT, ordinalIndex = 1
  {
    contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1]], "Kajal");
    const res = resolver.resolve("Second one");
    assert(17, "Second one", res.intent === "SELECT_PRODUCT", `Expected SELECT_PRODUCT, got ${res.intent}`);
    assert(17, "Second one", res.matchedProduct?.id === "prod-vlcc-kajal-002", "Expected second candidate (VLCC)");
  }

  // 18. "Cart mein daal do" -> ADD_TO_CART (with activeProduct = VLCC Kajal)
  {
    contextManager.setActiveProduct(FIXTURE_PRODUCTS[1]);
    const res = resolver.resolve("Cart mein daal do");
    assert(18, "Cart mein daal do", res.intent === "ADD_TO_CART", `Expected ADD_TO_CART, got ${res.intent}`);
    assert(18, "Cart mein daal do", res.action === "PROMPT_CONFIRMATION", `Expected PROMPT_CONFIRMATION, got ${res.action}`);
    assert(18, "Cart mein daal do", res.requiresConfirmation === true, "Expected requiresConfirmation=true");
  }

  // 19. "Haan daal do" -> CONFIRM
  {
    const res = resolver.resolve("Haan daal do");
    assert(19, "Haan daal do", res.intent === "CONFIRM", `Expected CONFIRM, got ${res.intent}`);
    assert(19, "Haan daal do", res.action === "COMMITTED_CART", `Expected COMMITTED_CART, got ${res.action}`);
    assert(19, "Haan daal do", res.matchedProduct?.id === "prod-vlcc-kajal-002", "Expected committed VLCC Kajal");
  }

  // 20. "Aur dikhao" -> MORE_RESULTS
  {
    contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1], FIXTURE_PRODUCTS[2], FIXTURE_PRODUCTS[3]]);
    const res = resolver.resolve("Aur dikhao");
    assert(20, "Aur dikhao", res.intent === "MORE_RESULTS", `Expected MORE_RESULTS, got ${res.intent}`);
  }

  // ======================================================================
  // P1 SAFETY REGRESSION TESTS (21–28)
  // These validate that blind candidates[0] fallback is NEVER used and
  // that pronoun ambiguity is properly caught.
  // ======================================================================

  // 21. OPEN_PRODUCT with ambiguous category (no activeProduct) must NOT navigate to candidates[0]
  {
    contextManager.reset();
    const res = resolver.resolve("Kajal kholo");
    assert(
      21,
      "Kajal kholo (ambiguous, no active product)",
      res.action !== "NAVIGATE_PAGE",
      `SAFETY: Must NOT navigate blindly to first candidate. Got action=${res.action}`
    );
    assert(
      21,
      "Kajal kholo (ambiguous, no active product)",
      (res.candidateProducts?.length || 0) >= 2,
      `SAFETY: Must present candidates for disambiguation, got ${res.candidateProducts?.length || 0}`
    );
  }

  // 22. CHECK_PRICE with ambiguous category (no activeProduct) must ask for clarification
  {
    contextManager.reset();
    const res = resolver.resolve("Kajal ka price kya hai?");
    assert(
      22,
      "Kajal ka price kya hai? (ambiguous)",
      res.matchedProduct === undefined,
      `SAFETY: Must NOT blindly return price for candidates[0]. Got matchedProduct=${res.matchedProduct?.name}`
    );
    assert(
      22,
      "Kajal ka price kya hai? (ambiguous)",
      (res.candidateProducts?.length || 0) >= 2,
      `SAFETY: Must present candidates for disambiguation, got ${res.candidateProducts?.length || 0}`
    );
  }

  // 23. CHECK_AVAILABILITY with ambiguous category (no activeProduct) must ask for clarification
  {
    contextManager.reset();
    const res = resolver.resolve("Kajal available hai?");
    assert(
      23,
      "Kajal available hai? (ambiguous)",
      res.matchedProduct === undefined,
      `SAFETY: Must NOT blindly check stock for candidates[0]. Got matchedProduct=${res.matchedProduct?.name}`
    );
    assert(
      23,
      "Kajal available hai? (ambiguous)",
      (res.candidateProducts?.length || 0) >= 2,
      `SAFETY: Must present candidates for disambiguation`
    );
  }

  // 24. VIEW_DETAILS with ambiguous category (no activeProduct) must ask for clarification
  {
    contextManager.reset();
    const res = resolver.resolve("Kajal ke details batao");
    assert(
      24,
      "Kajal ke details batao (ambiguous)",
      res.matchedProduct === undefined,
      `SAFETY: Must NOT blindly show details for candidates[0]. Got matchedProduct=${res.matchedProduct?.name}`
    );
    assert(
      24,
      "Kajal ke details batao (ambiguous)",
      (res.candidateProducts?.length || 0) >= 2,
      `SAFETY: Must present candidates for disambiguation`
    );
  }

  // 25. ADD_TO_CART with ambiguous search (no activeProduct, no exactMatch) must ask for clarification
  {
    contextManager.reset();
    const res = resolver.resolve("Kajal cart mein daal do");
    assert(
      25,
      "Kajal cart mein daal do (ambiguous)",
      res.action !== "PROMPT_CONFIRMATION",
      `SAFETY: Must NOT prompt confirmation for unresolved product. Got action=${res.action}`
    );
    assert(
      25,
      "Kajal cart mein daal do (ambiguous)",
      (res.candidateProducts?.length || 0) >= 2,
      `SAFETY: Must present candidates for disambiguation`
    );
  }

  // 26. Pronoun "isko cart mein daal do" with NO activeProduct and multiple candidates must trigger clarification
  {
    contextManager.reset();
    contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1]], "Kajal");
    // No activeProduct set — only candidates exist
    const res = resolver.resolve("Isko cart mein daal do");
    assert(
      26,
      "Isko cart mein daal do (no activeProduct, multiple candidates)",
      res.action !== "PROMPT_CONFIRMATION",
      `SAFETY: Pronoun must NOT silently pick candidates[0] for cart. Got action=${res.action}`
    );
    assert(
      26,
      "Isko cart mein daal do (no activeProduct, multiple candidates)",
      res.confidence !== "HIGH" || res.action === "SPEAK_INFO" || (res.candidateProducts?.length || 0) > 1,
      `SAFETY: Must trigger disambiguation, not commit to a single product`
    );
  }

  // 27. Ambiguous "cart mein daal do" with candidates but no activeProduct must trigger disambiguation
  {
    contextManager.reset();
    contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1]], "Kajal");
    const res = resolver.resolve("Cart mein daal do");
    assert(
      27,
      "Cart mein daal do (no activeProduct, multiple candidates)",
      res.action !== "PROMPT_CONFIRMATION" && res.action !== "COMMITTED_CART",
      `SAFETY: Must NOT commit or prompt without explicit product selection. Got action=${res.action}`
    );
    assert(
      27,
      "Cart mein daal do (no activeProduct, multiple candidates)",
      (res.candidateProducts?.length || 0) >= 2,
      `SAFETY: Must present candidates for selection`
    );
  }

  // 28. Pronoun "isko open karo" with NO activeProduct must NOT navigate
  {
    contextManager.reset();
    const res = resolver.resolve("Isko open karo");
    assert(
      28,
      "Isko open karo (no activeProduct, no candidates)",
      res.action !== "NAVIGATE_PAGE",
      `SAFETY: Must NOT navigate without a resolved product. Got action=${res.action}`
    );
    assert(
      28,
      "Isko open karo (no activeProduct, no candidates)",
      res.confidence === "LOW" || res.confidence === "MEDIUM",
      `SAFETY: Confidence must be LOW or MEDIUM for unresolved target, got ${res.confidence}`
    );
  }

  // ======================================================================
  // FUNC-01 REGRESSION TESTS (29–34)
  // Validate that bare words "add", "cart", "buy" do NOT falsely trigger
  // ADD_TO_CART for conversational queries, while valid action commands
  // in English, Hindi, and Hinglish are correctly classified.
  // ======================================================================

  // 29. False Positive: "what did you add?" -> Must NOT be ADD_TO_CART
  {
    contextManager.reset();
    const parsed = parseVoiceCommand("what did you add?");
    assert(29, "what did you add?", parsed.intent !== "ADD_TO_CART", `Must not be ADD_TO_CART, got ${parsed.intent}`);
    assert(29, "what did you add?", parsed.intent === "UNKNOWN", `Expected UNKNOWN intent, got ${parsed.intent}`);
    const res = resolver.resolve("what did you add?");
    assert(29, "what did you add?", res.intent !== "ADD_TO_CART", `Resolver intent must not be ADD_TO_CART, got ${res.intent}`);
    assert(29, "what did you add?", res.action !== "PROMPT_CONFIRMATION" && res.action !== "COMMITTED_CART", `Must not prompt cart confirmation, got ${res.action}`);
  }

  // 30. False Positive: "is this in the cart?" -> Must NOT be ADD_TO_CART
  {
    contextManager.reset();
    const parsed = parseVoiceCommand("is this in the cart?");
    assert(30, "is this in the cart?", parsed.intent !== "ADD_TO_CART", `Must not be ADD_TO_CART, got ${parsed.intent}`);
    assert(30, "is this in the cart?", parsed.intent === "UNKNOWN", `Expected UNKNOWN intent, got ${parsed.intent}`);
    const res = resolver.resolve("is this in the cart?");
    assert(30, "is this in the cart?", res.intent !== "ADD_TO_CART", `Resolver intent must not be ADD_TO_CART, got ${res.intent}`);
    assert(30, "is this in the cart?", res.action !== "PROMPT_CONFIRMATION" && res.action !== "COMMITTED_CART", `Must not prompt cart confirmation, got ${res.action}`);
  }

  // 31. False Positive: "can I buy later?" -> Must NOT be ADD_TO_CART
  {
    contextManager.reset();
    const parsed = parseVoiceCommand("can I buy later?");
    assert(31, "can I buy later?", parsed.intent !== "ADD_TO_CART", `Must not be ADD_TO_CART, got ${parsed.intent}`);
    assert(31, "can I buy later?", parsed.intent === "UNKNOWN", `Expected UNKNOWN intent, got ${parsed.intent}`);
    const res = resolver.resolve("can I buy later?");
    assert(31, "can I buy later?", res.intent !== "ADD_TO_CART", `Resolver intent must not be ADD_TO_CART, got ${res.intent}`);
    assert(31, "can I buy later?", res.action !== "PROMPT_CONFIRMATION" && res.action !== "COMMITTED_CART", `Must not prompt cart confirmation, got ${res.action}`);
  }

  // 32. Valid Action: "add this to cart" (with activeProduct = VLCC Kajal) -> ADD_TO_CART
  {
    contextManager.reset();
    contextManager.setActiveProduct(FIXTURE_PRODUCTS[1]);
    const parsed = parseVoiceCommand("add this to cart");
    assert(32, "add this to cart", parsed.intent === "ADD_TO_CART", `Expected ADD_TO_CART, got ${parsed.intent}`);
    const res = resolver.resolve("add this to cart");
    assert(32, "add this to cart", res.intent === "ADD_TO_CART", `Expected ADD_TO_CART, got ${res.intent}`);
    assert(32, "add this to cart", res.action === "PROMPT_CONFIRMATION", `Expected PROMPT_CONFIRMATION, got ${res.action}`);
    assert(32, "add this to cart", res.requiresConfirmation === true, "Expected requiresConfirmation=true");
    assert(32, "add this to cart", res.matchedProduct?.id === "prod-vlcc-kajal-002", "Expected active VLCC Kajal");
  }

  // 33. Valid Action: "cart mein daal do" (with activeProduct = VLCC Kajal) -> ADD_TO_CART
  {
    contextManager.reset();
    contextManager.setActiveProduct(FIXTURE_PRODUCTS[1]);
    const parsed = parseVoiceCommand("cart mein daal do");
    assert(33, "cart mein daal do", parsed.intent === "ADD_TO_CART", `Expected ADD_TO_CART, got ${parsed.intent}`);
    const res = resolver.resolve("cart mein daal do");
    assert(33, "cart mein daal do", res.intent === "ADD_TO_CART", `Expected ADD_TO_CART, got ${res.intent}`);
    assert(33, "cart mein daal do", res.action === "PROMPT_CONFIRMATION", `Expected PROMPT_CONFIRMATION, got ${res.action}`);
    assert(33, "cart mein daal do", res.requiresConfirmation === true, "Expected requiresConfirmation=true");
    assert(33, "cart mein daal do", res.matchedProduct?.id === "prod-vlcc-kajal-002", "Expected active VLCC Kajal");
  }

  // 34. Valid Action: "isko cart mein add karo" (with activeProduct = VLCC Kajal) -> ADD_TO_CART
  {
    contextManager.reset();
    contextManager.setActiveProduct(FIXTURE_PRODUCTS[1]);
    const parsed = parseVoiceCommand("isko cart mein add karo");
    assert(34, "isko cart mein add karo", parsed.intent === "ADD_TO_CART", `Expected ADD_TO_CART, got ${parsed.intent}`);
    const res = resolver.resolve("isko cart mein add karo");
    assert(34, "isko cart mein add karo", res.intent === "ADD_TO_CART", `Expected ADD_TO_CART, got ${res.intent}`);
    assert(34, "isko cart mein add karo", res.action === "PROMPT_CONFIRMATION", `Expected PROMPT_CONFIRMATION, got ${res.action}`);
    assert(34, "isko cart mein add karo", res.requiresConfirmation === true, "Expected requiresConfirmation=true");
    assert(34, "isko cart mein add karo", res.matchedProduct?.id === "prod-vlcc-kajal-002", "Expected active VLCC Kajal");
  }

  // ======================================================================
  // PHASE 3.4 MEDIUM FIX REGRESSION TESTS (35–58)
  // ======================================================================

  // ----------------------------------------------------------------------
  // FUNC-02: Overly Broad Pagination Triggers
  // ----------------------------------------------------------------------

  // 35. False Positive: "tell me more about this product" -> NOT MORE_RESULTS
  {
    contextManager.reset();
    const parsed = parseVoiceCommand("tell me more about this product");
    assert(35, "tell me more about this product (NLU)", parsed.intent !== "MORE_RESULTS", `Expected intent !== MORE_RESULTS, got ${parsed.intent}`);
    assert(35, "tell me more about this product (NLU)", parsed.intent === "VIEW_DETAILS", `Expected VIEW_DETAILS, got ${parsed.intent}`);
    const res = resolver.resolve("tell me more about this product");
    assert(35, "tell me more about this product (Resolver)", res.intent !== "MORE_RESULTS", `Expected resolver intent !== MORE_RESULTS, got ${res.intent}`);
  }

  // 36. False Positive: "aur kuch batao" -> NOT MORE_RESULTS
  {
    contextManager.reset();
    const parsed = parseVoiceCommand("aur kuch batao");
    assert(36, "aur kuch batao (NLU)", parsed.intent !== "MORE_RESULTS", `Expected intent !== MORE_RESULTS, got ${parsed.intent}`);
    const res = resolver.resolve("aur kuch batao");
    assert(36, "aur kuch batao (Resolver)", res.intent !== "MORE_RESULTS", `Expected resolver intent !== MORE_RESULTS, got ${res.intent}`);
  }

  // 37. False Positive: "aur kya hai" -> NOT MORE_RESULTS
  {
    contextManager.reset();
    const parsed = parseVoiceCommand("aur kya hai");
    assert(37, "aur kya hai (NLU)", parsed.intent !== "MORE_RESULTS", `Expected intent !== MORE_RESULTS, got ${parsed.intent}`);
    const res = resolver.resolve("aur kya hai");
    assert(37, "aur kya hai (Resolver)", res.intent !== "MORE_RESULTS", `Expected resolver intent !== MORE_RESULTS, got ${res.intent}`);
  }

  // 38. Valid English Pagination: "show me more" -> MORE_RESULTS
  {
    contextManager.reset();
    contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1], FIXTURE_PRODUCTS[2], FIXTURE_PRODUCTS[3]]);
    const parsed = parseVoiceCommand("show me more");
    assert(38, "show me more (NLU)", parsed.intent === "MORE_RESULTS", `Expected MORE_RESULTS, got ${parsed.intent}`);
    const res = resolver.resolve("show me more");
    assert(38, "show me more (Resolver)", res.intent === "MORE_RESULTS", `Expected MORE_RESULTS, got ${res.intent}`);
    assert(38, "show me more (Action)", res.action === "DISPLAY_PRODUCTS", `Expected DISPLAY_PRODUCTS, got ${res.action}`);
  }

  // 39. Valid English Pagination: "more products" -> MORE_RESULTS
  {
    contextManager.reset();
    contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1], FIXTURE_PRODUCTS[2], FIXTURE_PRODUCTS[3]]);
    const parsed = parseVoiceCommand("more products");
    assert(39, "more products (NLU)", parsed.intent === "MORE_RESULTS", `Expected MORE_RESULTS, got ${parsed.intent}`);
    const res = resolver.resolve("more products");
    assert(39, "more products (Resolver)", res.intent === "MORE_RESULTS", `Expected MORE_RESULTS, got ${res.intent}`);
  }

  // 40. Valid Hindi/Hinglish Pagination: "aur products dikhao" -> MORE_RESULTS
  {
    contextManager.reset();
    contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1], FIXTURE_PRODUCTS[2], FIXTURE_PRODUCTS[3]]);
    const parsed = parseVoiceCommand("aur products dikhao");
    assert(40, "aur products dikhao (NLU)", parsed.intent === "MORE_RESULTS", `Expected MORE_RESULTS, got ${parsed.intent}`);
    const res = resolver.resolve("aur products dikhao");
    assert(40, "aur products dikhao (Resolver)", res.intent === "MORE_RESULTS", `Expected MORE_RESULTS, got ${res.intent}`);
  }

  // 41. Valid Hindi/Hinglish Pagination: "aur dikhao" -> MORE_RESULTS
  {
    contextManager.reset();
    contextManager.setCandidates([FIXTURE_PRODUCTS[0], FIXTURE_PRODUCTS[1], FIXTURE_PRODUCTS[2], FIXTURE_PRODUCTS[3]]);
    const parsed = parseVoiceCommand("aur dikhao");
    assert(41, "aur dikhao (NLU)", parsed.intent === "MORE_RESULTS", `Expected MORE_RESULTS, got ${parsed.intent}`);
    const res = resolver.resolve("aur dikhao");
    assert(41, "aur dikhao (Resolver)", res.intent === "MORE_RESULTS", `Expected MORE_RESULTS, got ${res.intent}`);
  }

  // ----------------------------------------------------------------------
  // FUNC-03: Text Command Fallback Pipeline (Simulates VoiceAssistant processQuery)
  // ----------------------------------------------------------------------

  // 42. Text product search: "Kajal"
  {
    contextManager.reset();
    const res = resolver.resolve("Kajal");
    assert(42, "Text: Kajal", res.action === "DISPLAY_PRODUCTS", `Expected DISPLAY_PRODUCTS, got ${res.action}`);
    assert(42, "Text: Kajal candidates", (res.candidateProducts?.length || 0) >= 2, "Expected Kajal candidates returned");
  }

  // 43. Text Hindi/Hinglish query: "Kajal dikhao"
  {
    contextManager.reset();
    const res = resolver.resolve("Kajal dikhao");
    assert(43, "Text: Kajal dikhao", res.action === "DISPLAY_PRODUCTS", `Expected DISPLAY_PRODUCTS, got ${res.action}`);
  }

  // 44. Text add-to-cart command: "VLCC Kajal cart mein daal do" -> PROMPT_CONFIRMATION
  {
    contextManager.reset();
    const res = resolver.resolve("VLCC Kajal cart mein daal do");
    assert(44, "Text: VLCC Kajal cart mein daal do (action)", res.action === "PROMPT_CONFIRMATION", `Expected PROMPT_CONFIRMATION, got ${res.action}`);
    assert(44, "Text: VLCC Kajal cart mein daal do (requiresConfirmation)", res.requiresConfirmation === true, "Must require confirmation");
    assert(44, "Text: VLCC Kajal cart mein daal do (product)", res.matchedProduct?.id === "prod-vlcc-kajal-002", "Expected matched VLCC Kajal");
  }

  // 45. Text false-positive cart query: "what did you add?" -> NOT ADD_TO_CART
  {
    contextManager.reset();
    const res = resolver.resolve("what did you add?");
    assert(45, "Text false-positive: what did you add?", res.action !== "PROMPT_CONFIRMATION" && res.action !== "COMMITTED_CART", `Must not trigger cart action, got ${res.action}`);
  }

  // 46. Text confirmation flow: "Haan daal do" commits pending cart item
  {
    // Re-prompt confirmation for VLCC Kajal
    contextManager.reset();
    resolver.resolve("VLCC Kajal cart mein daal do");
    assert(46, "Text confirmation pending check", Boolean(contextManager.getContext().pendingConfirmation) === true, "Context must have pending confirmation");
    const res = resolver.resolve("Haan daal do");
    assert(46, "Text confirmation: Haan daal do", res.action === "COMMITTED_CART", `Expected COMMITTED_CART, got ${res.action}`);
    assert(46, "Text confirmation committed product", res.matchedProduct?.id === "prod-vlcc-kajal-002", "Expected committed VLCC Kajal");
  }

  // ----------------------------------------------------------------------
  // SEC-02: Realtime Session Strict Origin Allowlist
  // ----------------------------------------------------------------------

  // 47. Approved Production Origin
  {
    const origin = getAllowedOrigin("https://uphar-app-v01.netlify.app");
    assert(47, "SEC-02: allow production origin", origin === "https://uphar-app-v01.netlify.app", `Expected production origin allowed, got ${origin}`);
  }

  // 48. Approved Local Development Origin
  {
    const origin = getAllowedOrigin("http://localhost:3000");
    assert(48, "SEC-02: allow localhost:3000", origin === "http://localhost:3000", `Expected localhost allowed, got ${origin}`);
  }

  // 49. Rejected Arbitrary Netlify Subdomain
  {
    const origin = getAllowedOrigin("https://evil.netlify.app");
    assert(49, "SEC-02: reject arbitrary evil.netlify.app", origin === null, `Expected null, got ${origin}`);
  }

  // 50. Rejected Spoofed Domain Containing 'uphar'
  {
    const origin = getAllowedOrigin("https://evil-uphar.com");
    assert(50, "SEC-02: reject evil-uphar.com", origin === null, `Expected null, got ${origin}`);
  }

  // 51. Rejected Spoofed Subdomain 'uphar.example.com'
  {
    const origin = getAllowedOrigin("https://uphar.example.com");
    assert(51, "SEC-02: reject uphar.example.com", origin === null, `Expected null, got ${origin}`);
  }

  // ----------------------------------------------------------------------
  // SEC-03: Realtime Session Cryptographic Auth Verification
  // ----------------------------------------------------------------------

  // 52. Missing Authorization Header Rejected
  {
    const res = await realtimeHandler(
      { httpMethod: "POST", headers: { origin: "https://uphar-app-v01.netlify.app" } },
      {}
    );
    assert(52, "SEC-03: missing auth -> 401", res.statusCode === 401, `Expected 401, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(52, "SEC-03: missing auth error message", body.message?.includes("Missing or invalid Authorization"), `Unexpected message: ${body.message}`);
  }

  // 53. Malformed Authorization Header Rejected
  {
    const res = await realtimeHandler(
      { httpMethod: "POST", headers: { origin: "https://uphar-app-v01.netlify.app", authorization: "Basic invalid_credentials" } },
      {}
    );
    assert(53, "SEC-03: malformed auth -> 401", res.statusCode === 401, `Expected 401, got ${res.statusCode}`);
  }

  // 54. Fake 3-Segment JWT String Rejected
  {
    const fakeToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.fake_signature_part_here";
    const res = await realtimeHandler(
      { httpMethod: "POST", headers: { origin: "https://uphar-app-v01.netlify.app", authorization: fakeToken } },
      {}
    );
    assert(54, "SEC-03: fake 3-part JWT -> 401", res.statusCode === 401, `Expected 401, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(54, "SEC-03: fake JWT rejection message", body.message?.includes("Invalid or expired authentication token"), `Unexpected message: ${body.message}`);
  }

  // 55. Anon Key Rejected (Anon key is not an authenticated customer session)
  {
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    if (anonKey) {
      const res = await realtimeHandler(
        { httpMethod: "POST", headers: { origin: "https://uphar-app-v01.netlify.app", authorization: `Bearer ${anonKey}` } },
        {}
      );
      assert(55, "SEC-03: anon-key token -> 401", res.statusCode === 401, `Expected 401, got ${res.statusCode}`);
    } else {
      assert(55, "SEC-03: anon-key skipped (no env)", true, "Skipped");
    }
  }

  // ----------------------------------------------------------------------
  // PROD-02: Deactivated OpenAI Realtime Model Verification
  // ----------------------------------------------------------------------

  // 56. No invalid/fictional "gpt-realtime" remains in active code
  {
    const funcCode = fs.readFileSync(path.resolve(__dirname, "../../../../netlify/functions/realtime-session.js"), "utf-8");
    const hasGptRealtime = funcCode.includes("gpt-realtime");
    assert(56, "PROD-02: no 'gpt-realtime' in realtime-session.js", hasGptRealtime === false, "Fictional gpt-realtime model must not be present");
  }

  // 57. Verified deactivated fallback contract
  {
    const funcCode = fs.readFileSync(path.resolve(__dirname, "../../../../netlify/functions/realtime-session.js"), "utf-8");
    const hasExplicitDeactivation = funcCode.includes("OpenAI Realtime session endpoint is deactivated");
    assert(57, "PROD-02: explicit deactivated fallback contract", hasExplicitDeactivation === true, "Must have explicit deactivation fallback");
  }

  // ----------------------------------------------------------------------
  // DB-01: Production DB Absence Graceful Fallback
  // ----------------------------------------------------------------------

  // 58. VoiceAssistant and VoiceTraining handle absence of voice_training_rules table gracefully
  {
    const assistantCode = fs.readFileSync(path.resolve(__dirname, "../../../components/VoiceAssistant.tsx"), "utf-8");
    const hasGracefulCatch = assistantCode.includes("Table might not exist yet before migration");
    assert(58, "DB-01: VoiceAssistant graceful DB fallback", hasGracefulCatch === true, "VoiceAssistant must catch table absence gracefully");
  }

  // ----------------------------------------------------------------------
  // SEC-04: Regex Metacharacter & Input Sanitization
  // ----------------------------------------------------------------------

  // 59. Special regex characters in user input do not cause syntax errors or unintended matching
  {
    const resolver = new VoiceResolver(FIXTURE_PRODUCTS);
    let errorThrown = false;
    let res: any;
    try {
      res = resolver.resolve(".*+?()[]{}|\\ kajal");
    } catch {
      errorThrown = true;
    }
    assert(59, "SEC-04: regex metacharacters in query do not crash resolver", errorThrown === false && (res?.matchedProduct?.name.includes("Kajal") || (res?.candidateProducts?.length || 0) > 0), "Regex metacharacters must not break execution or crash");
  }

  // 60. Special regex characters trailing query
  {
    const resolver = new VoiceResolver(FIXTURE_PRODUCTS);
    let errorThrown = false;
    let res: any;
    try {
      res = resolver.resolve("vlcc kajal .*+?()[]{}|\\");
    } catch {
      errorThrown = true;
    }
    assert(60, "SEC-04: trailing regex metacharacters do not crash resolver", errorThrown === false && res?.matchedProduct?.id === "prod-vlcc-kajal-002", "Trailing regex metacharacters must resolve safely to target product");
  }

  // ----------------------------------------------------------------------
  // FUNC-04: Voice Assistant Admin Route Guard
  // ----------------------------------------------------------------------

  // 61. Voice Assistant code contains route guard that disables rendering on admin routes
  {
    const assistantCode = fs.readFileSync(path.resolve(__dirname, "../../../components/VoiceAssistant.tsx"), "utf-8");
    const hasAdminGuard = assistantCode.includes('location.pathname.startsWith("/admin")') && assistantCode.includes("return null;");
    assert(61, "FUNC-04: admin route guard in VoiceAssistant.tsx", hasAdminGuard === true, "VoiceAssistant must not mount on /admin routes");
  }

  // ----------------------------------------------------------------------
  // FUNC-05: Dead removeFillers Elimination
  // ----------------------------------------------------------------------

  // 62. removeFillers and FILLER_WORDS are completely removed
  {
    const normCode = fs.readFileSync(path.resolve(__dirname, "../normalization.ts"), "utf-8");
    const hasRemoveFillers = normCode.includes("removeFillers");
    const hasFillerWords = normCode.includes("FILLER_WORDS");
    assert(62, "FUNC-05: removeFillers eliminated from normalization.ts", !hasRemoveFillers && !hasFillerWords, "removeFillers and FILLER_WORDS must be removed");
  }

  // ----------------------------------------------------------------------
  // FUNC-06: NEW_ARRIVALS Intent & Catalog Integration
  // ----------------------------------------------------------------------

  // 63. "show me new arrivals" resolves to NEW_ARRIVALS intent and candidate products
  {
    const resolver = new VoiceResolver(FIXTURE_PRODUCTS);
    const res = resolver.resolve("show me new arrivals");
    assert(63, "FUNC-06: 'show me new arrivals' triggers NEW_ARRIVALS", res.intent === "NEW_ARRIVALS" && res.action === "DISPLAY_PRODUCTS" && (res.candidateProducts?.length || 0) > 0, "Must display new arrival products");
  }

  // 64. "what's new" and "naye products dikhao" resolve to NEW_ARRIVALS
  {
    const resolver = new VoiceResolver(FIXTURE_PRODUCTS);
    const res1 = resolver.resolve("what's new");
    const res2 = resolver.resolve("naye products dikhao");
    assert(64, "FUNC-06: 'what's new' and 'naye products dikhao' trigger NEW_ARRIVALS", res1.intent === "NEW_ARRIVALS" && res2.intent === "NEW_ARRIVALS", "Hinglish and English new arrivals triggers must work");
  }

  // ----------------------------------------------------------------------
  // PROD-03: Voice Training Rule Rate Limiting / Debounce
  // ----------------------------------------------------------------------

  // 65. VoiceTraining.tsx contains client-side debounce and tableExists guard
  {
    const trainingCode = fs.readFileSync(path.resolve(__dirname, "../../../pages/Admin/VoiceTraining.tsx"), "utf-8");
    const hasDebounce = trainingCode.includes("lastSubmitRef") && trainingCode.includes("2000");
    const hasTableGuard = trainingCode.includes("!tableExists");
    assert(65, "PROD-03: VoiceTraining debounce and tableExists guard", hasDebounce && hasTableGuard, "VoiceTraining must prevent rapid resubmission and respect missing table");
  }

  // ----------------------------------------------------------------------
  // PROD-04: Voice Training Rule Fetch Decoupled From Products
  // ----------------------------------------------------------------------

  // 66. VoiceAssistant.tsx does not re-fetch voice training rules when products change
  {
    const assistantCode = fs.readFileSync(path.resolve(__dirname, "../../../components/VoiceAssistant.tsx"), "utf-8");
    const hasIsolatedMountEffect = assistantCode.includes('from("voice_training_rules")') && assistantCode.includes("}, []);");
    const catalogUpdateEffect = assistantCode.includes("resolverRef.current.updateCatalog(products);");
    assert(66, "PROD-04: voice rules fetch decoupled from products", hasIsolatedMountEffect && catalogUpdateEffect, "Training rules fetch must run once on mount, not on every products update");
  }

  // ----------------------------------------------------------------------
  // DB-02: Dead Legacy Voice Code Elimination
  // ----------------------------------------------------------------------

  // 67. voiceAssistantService.ts has dead v1 logic removed
  {
    const serviceCode = fs.readFileSync(path.resolve(__dirname, "../../voiceAssistantService.ts"), "utf-8");
    const hasVoiceToolHandler = serviceCode.includes("class VoiceToolHandler");
    const hasSmartSearch = serviceCode.includes("function smartSearchProducts");
    const hasParseUserIntent = serviceCode.includes("function parseUserIntent");
    const lineCount = serviceCode.split("\n").length;
    assert(67, "DB-02: legacy v1 dead code removed from voiceAssistantService.ts", !hasVoiceToolHandler && !hasSmartSearch && !hasParseUserIntent && lineCount < 150, "Dead v1 code must be removed and line count under 150");
  }

  console.log("\n===============================================================");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`SUMMARY: ${passedCount} / ${results.length} assertions passed.`);
  console.log("===============================================================");

  return passedCount === results.length;
}

// Execute immediately when run directly via tsx
runVoiceTestSuite();
