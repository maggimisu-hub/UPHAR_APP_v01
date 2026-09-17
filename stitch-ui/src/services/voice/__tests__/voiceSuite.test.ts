/**
 * Automated Golden Test Suite for Uphar Voice Shopping Assistant v2.0
 * 
 * Verifies all 20 golden queries against catalog fixtures.
 * Run via: npx tsx src/services/voice/__tests__/voiceSuite.test.ts
 */

import { Product } from "../../../types";
import { VoiceResolver } from "../voiceResolver";
import { parseVoiceCommand } from "../nlu";

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

export function runVoiceTestSuite(): boolean {
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

  console.log("\n===============================================================");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`SUMMARY: ${passedCount} / ${results.length} assertions passed.`);
  console.log("===============================================================");

  return passedCount === results.length;
}

// Execute immediately when run directly via tsx
runVoiceTestSuite();
