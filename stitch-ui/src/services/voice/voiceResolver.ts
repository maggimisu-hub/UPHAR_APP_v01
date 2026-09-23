/**
 * Master Voice Command Resolver for Uphar Voice Assistant
 * 
 * Orchestrates NLU, Catalog Search, Multi-Turn Context, and Response Generation.
 * Strictly implements the PRD v2.0 commerce invariants.
 */

import { Product } from "../../types";
import { VoiceActionResult } from "./types";
import { VoiceMatchConfig, DEFAULT_VOICE_MATCH_CONFIG } from "./config";
import { parseVoiceCommand } from "./nlu";
import { CatalogIndex, extractBrandFromProduct, getProductTotalStock } from "./catalogIndex";
import { ConversationContextManager } from "./contextManager";
import {
  formatPriceText,
  formatAvailabilityText,
  formatProductDetailsText,
  formatCandidatesSummaryText,
  formatUncarriedBrandWithAlternatives,
  formatAddToCartPrompt,
  formatCartCommittedText,
  formatCartCancelledText,
  formatOpenProductText,
} from "./responses";

export class VoiceResolver {
  private catalogIndex: CatalogIndex;
  private contextManager: ConversationContextManager;
  private config: VoiceMatchConfig;

  constructor(
    products: Product[] = [],
    config: VoiceMatchConfig = DEFAULT_VOICE_MATCH_CONFIG,
    initialContext?: ConversationContextManager
  ) {
    this.config = config;
    this.catalogIndex = new CatalogIndex(products, config);
    this.contextManager = initialContext || new ConversationContextManager();
  }

  public updateCatalog(products: Product[]): void {
    this.catalogIndex.setProducts(products);
  }

  public getContextManager(): ConversationContextManager {
    return this.contextManager;
  }

  /**
   * Dispatches utterance to appropriate handler based on parsed intent.
   */
  public resolve(rawQuery: string): VoiceActionResult {
    const context = this.contextManager.getContext();
    const hasActiveContext = !!(context.activeProduct || (context.candidateProducts && context.candidateProducts.length > 0));

    const parsed = parseVoiceCommand(rawQuery, hasActiveContext);
    const { intent, entities, language } = parsed;

    this.contextManager.setLastIntent(intent);

    // Clear stale cart confirmation if a new non-confirmation intent arrives
    if (intent !== "CONFIRM" && intent !== "CANCEL" && context.pendingConfirmation) {
      this.contextManager.clearPendingConfirmation();
    }

    switch (intent) {
      case "CONFIRM":
        return this.handleConfirm(language);

      case "CANCEL":
        return this.handleCancel(language);

      case "MORE_RESULTS":
        return this.handleMoreResults(language);

      case "NEW_ARRIVALS":
        return this.handleNewArrivals(language);

      case "OPEN_PRODUCT":
        return this.handleOpenProduct(entities, language);

      case "SELECT_PRODUCT":
        return this.handleSelectProduct(entities, language);

      case "CHECK_PRICE":
        return this.handleCheckPrice(entities, language);

      case "CHECK_AVAILABILITY":
        return this.handleCheckAvailability(entities, language);

      case "VIEW_DETAILS":
        return this.handleViewDetails(entities, language);

      case "ADD_TO_CART":
        return this.handleAddToCart(entities, language);

      case "SEARCH_PRODUCT":
        return this.handleSearchProduct(entities, language);

      case "SEARCH_CATEGORY":
        return this.handleSearchCategory(entities, language);

      case "UNKNOWN":
      default:
        return this.handleUnknown(language);
    }
  }

  private handleConfirm(lang: "en" | "hi" | "hinglish"): VoiceActionResult {
    const pending = this.contextManager.getContext().pendingConfirmation;
    if (!pending) {
      const msg = "There is nothing waiting for confirmation.";
      return {
        action: "NONE",
        intent: "CONFIRM",
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    const product = pending.product;
    this.contextManager.clearPendingConfirmation();
    const msg = formatCartCommittedText(product, lang);

    return {
      action: "COMMITTED_CART",
      intent: "CONFIRM",
      matchedProduct: product,
      message: msg,
      spokenText: msg,
      confidence: "HIGH",
    };
  }

  private handleCancel(lang: "en" | "hi" | "hinglish"): VoiceActionResult {
    const pending = this.contextManager.getContext().pendingConfirmation;
    if (!pending) {
      const msg = "Cancelled.";
      return {
        action: "NONE",
        intent: "CANCEL",
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    const product = pending.product;
    this.contextManager.clearPendingConfirmation();
    const msg = formatCartCancelledText(product, lang);

    return {
      action: "NONE",
      intent: "CANCEL",
      matchedProduct: product,
      message: msg,
      spokenText: msg,
      confidence: "HIGH",
    };
  }

  private handleMoreResults(lang: "en" | "hi" | "hinglish"): VoiceActionResult {
    const { currentBatch, hasMore, exhausted } = this.contextManager.paginateCandidates();

    if (exhausted || currentBatch.length === 0) {
      const msg = lang === "hi" ? "और कोई प्रोडक्ट्स उपलब्ध नहीं हैं।" : "No more results to show.";
      return {
        action: "SPEAK_INFO",
        intent: "MORE_RESULTS",
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    const msg = formatCandidatesSummaryText(currentBatch, undefined, lang);
    return {
      action: "DISPLAY_PRODUCTS",
      intent: "MORE_RESULTS",
      candidateProducts: currentBatch,
      message: msg,
      spokenText: msg,
      confidence: "HIGH",
    };
  }

  private handleNewArrivals(lang: "en" | "hi" | "hinglish"): VoiceActionResult {
    const products = this.catalogIndex.getProducts();
    const newArrivals = products.filter((p) => Boolean(p.newArrival));

    if (newArrivals.length === 0) {
      const msg =
        lang === "hi"
          ? "फ़िलहाल कोई नए प्रोडक्ट्स उपलब्ध नहीं हैं।"
          : "There are currently no new arrivals available.";
      return {
        action: "SPEAK_INFO",
        intent: "NEW_ARRIVALS",
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    this.contextManager.setCandidates(newArrivals);
    const names = newArrivals.slice(0, 3).map((p) => p.name).join(", ");
    const msg =
      lang === "hi"
        ? `नए अराइवल्स में ये प्रोडक्ट्स हैं: ${names}।`
        : `Here are the latest new arrivals: ${names}.`;

    return {
      action: "DISPLAY_PRODUCTS",
      intent: "NEW_ARRIVALS",
      candidateProducts: newArrivals.slice(0, 3),
      message: msg,
      spokenText: msg,
      confidence: "HIGH",
    };
  }

  private handleOpenProduct(
    entities: any,
    lang: "en" | "hi" | "hinglish"
  ): VoiceActionResult {
    // 1. Try resolving target from context
    const { targetProduct, collisionDetected } = this.contextManager.resolveTargetProduct(entities);

    let product = targetProduct;

    // 2. If not found in context and no collision, search catalog
    if (!product && !collisionDetected) {
      const searchRes = this.catalogIndex.search(entities);
      if (searchRes.exactMatch) {
        product = searchRes.exactMatch;
      } else if (searchRes.candidates.length > 0) {
        // SAFETY: Do NOT blindly select candidates[0]. Ask the user to clarify.
        this.contextManager.setCandidates(searchRes.candidates, entities.category, entities.brand);
        const names = searchRes.candidates.slice(0, 3).map((p) => p.name).join(", ");
        const msg =
          lang === "hi"
            ? `कई प्रोडक्ट्स मिले: ${names}. कौन सा खोलना है?`
            : `I found multiple products: ${names}. Which one would you like to open?`;
        return {
          action: "DISPLAY_PRODUCTS",
          intent: "OPEN_PRODUCT",
          candidateProducts: searchRes.candidates.slice(0, 3),
          message: msg,
          spokenText: msg,
          confidence: "MEDIUM",
        };
      }
    }

    if (product) {
      this.contextManager.setActiveProduct(product);
      const msg = formatOpenProductText(product, lang);
      return {
        action: "NAVIGATE_PAGE",
        intent: "OPEN_PRODUCT",
        matchedProduct: product,
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    const msg =
      lang === "hi"
        ? "माफ़ कीजिए, वह प्रोडक्ट नहीं मिला। आप कौन सा प्रोडक्ट खोलना चाहते हैं?"
        : "Could not find that product to open. Which product would you like to view?";

    return {
      action: "SPEAK_INFO",
      intent: "OPEN_PRODUCT",
      message: msg,
      spokenText: msg,
      confidence: "LOW",
    };
  }

  private handleSelectProduct(
    entities: any,
    lang: "en" | "hi" | "hinglish"
  ): VoiceActionResult {
    const { targetProduct } = this.contextManager.resolveTargetProduct(entities);

    if (targetProduct) {
      this.contextManager.setActiveProduct(targetProduct);
      const msg = formatPriceText(targetProduct, lang);
      return {
        action: "DISPLAY_PRODUCTS",
        intent: "SELECT_PRODUCT",
        matchedProduct: targetProduct,
        candidateProducts: [targetProduct],
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    const msg =
      lang === "hi"
        ? "कृपया बताएं कि आप कौन सा प्रोडक्ट चुनना चाहते हैं।"
        : "Please specify which product you would like to select.";

    return {
      action: "SPEAK_INFO",
      intent: "SELECT_PRODUCT",
      message: msg,
      spokenText: msg,
      confidence: "LOW",
    };
  }

  private handleCheckPrice(
    entities: any,
    lang: "en" | "hi" | "hinglish"
  ): VoiceActionResult {
    const { targetProduct, collisionDetected } = this.contextManager.resolveTargetProduct(entities);

    let product = targetProduct;

    if (!product) {
      const searchRes = this.catalogIndex.search(entities);
      if (searchRes.suggestedAlternatives && searchRes.suggestedAlternatives.length > 0) {
        const altMsg = formatUncarriedBrandWithAlternatives(
          entities.brand || "that brand",
          entities.category,
          searchRes.suggestedAlternatives,
          lang
        );
        return {
          action: "SPEAK_INFO",
          intent: "CHECK_PRICE",
          candidateProducts: searchRes.suggestedAlternatives,
          message: altMsg,
          spokenText: altMsg,
          confidence: "MEDIUM",
        };
      }
      if (searchRes.exactMatch) {
        product = searchRes.exactMatch;
      } else if (searchRes.candidates.length > 0) {
        // SAFETY: Do NOT blindly select candidates[0]. Ask the user to clarify.
        this.contextManager.setCandidates(searchRes.candidates, entities.category, entities.brand);
        const names = searchRes.candidates.slice(0, 3).map((p) => p.name).join(", ");
        const msg =
          lang === "hi"
            ? `कई प्रोडक्ट्स मिले: ${names}. किसका दाम जानना है?`
            : `I found multiple products: ${names}. Which one's price would you like to know?`;
        return {
          action: "DISPLAY_PRODUCTS",
          intent: "CHECK_PRICE",
          candidateProducts: searchRes.candidates.slice(0, 3),
          message: msg,
          spokenText: msg,
          confidence: "MEDIUM",
        };
      }
    }

    if (product) {
      this.contextManager.setActiveProduct(product);
      const msg = formatPriceText(product, lang);
      return {
        action: "SPEAK_INFO",
        intent: "CHECK_PRICE",
        matchedProduct: product,
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    const msg =
      lang === "hi"
        ? "माफ़ कीजिए, उस प्रोडक्ट का दाम नहीं मिल सका।"
        : "Sorry, I could not find pricing for that product.";

    return {
      action: "SPEAK_INFO",
      intent: "CHECK_PRICE",
      message: msg,
      spokenText: msg,
      confidence: "LOW",
    };
  }

  private handleCheckAvailability(
    entities: any,
    lang: "en" | "hi" | "hinglish"
  ): VoiceActionResult {
    const { targetProduct } = this.contextManager.resolveTargetProduct(entities);
    let product = targetProduct;

    if (!product) {
      const searchRes = this.catalogIndex.search(entities);
      if (searchRes.exactMatch) {
        product = searchRes.exactMatch;
      } else if (searchRes.candidates.length > 0) {
        // SAFETY: Do NOT blindly select candidates[0]. Ask the user to clarify.
        this.contextManager.setCandidates(searchRes.candidates, entities.category, entities.brand);
        const names = searchRes.candidates.slice(0, 3).map((p) => p.name).join(", ");
        const msg =
          lang === "hi"
            ? `कई प्रोडक्ट्स मिले: ${names}. किसकी उपलब्धता जानना है?`
            : `I found multiple products: ${names}. Which one's availability would you like to check?`;
        return {
          action: "DISPLAY_PRODUCTS",
          intent: "CHECK_AVAILABILITY",
          candidateProducts: searchRes.candidates.slice(0, 3),
          message: msg,
          spokenText: msg,
          confidence: "MEDIUM",
        };
      }
    }

    if (product) {
      this.contextManager.setActiveProduct(product);
      const msg = formatAvailabilityText(product, lang);
      return {
        action: "SPEAK_INFO",
        intent: "CHECK_AVAILABILITY",
        matchedProduct: product,
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    const msg =
      lang === "hi"
        ? "माफ़ कीजिए, स्टॉक की जानकारी नहीं मिल सकी।"
        : "Sorry, I could not find stock information for that item.";

    return {
      action: "SPEAK_INFO",
      intent: "CHECK_AVAILABILITY",
      message: msg,
      spokenText: msg,
      confidence: "LOW",
    };
  }

  private handleViewDetails(
    entities: any,
    lang: "en" | "hi" | "hinglish"
  ): VoiceActionResult {
    const { targetProduct } = this.contextManager.resolveTargetProduct(entities);
    let product = targetProduct;

    if (!product) {
      const searchRes = this.catalogIndex.search(entities);
      if (searchRes.exactMatch) {
        product = searchRes.exactMatch;
      } else if (searchRes.candidates.length > 0) {
        // SAFETY: Do NOT blindly select candidates[0]. Ask the user to clarify.
        this.contextManager.setCandidates(searchRes.candidates, entities.category, entities.brand);
        const names = searchRes.candidates.slice(0, 3).map((p) => p.name).join(", ");
        const msg =
          lang === "hi"
            ? `कई प्रोडक्ट्स मिले: ${names}. किसकी जानकारी चाहिए?`
            : `I found multiple products: ${names}. Which one's details would you like?`;
        return {
          action: "DISPLAY_PRODUCTS",
          intent: "VIEW_DETAILS",
          candidateProducts: searchRes.candidates.slice(0, 3),
          message: msg,
          spokenText: msg,
          confidence: "MEDIUM",
        };
      }
    }

    if (product) {
      this.contextManager.setActiveProduct(product);
      const msg = formatProductDetailsText(product, lang);
      return {
        action: "SPEAK_INFO",
        intent: "VIEW_DETAILS",
        matchedProduct: product,
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    const msg =
      lang === "hi"
        ? "माफ़ कीजिए, प्रोडक्ट की जानकारी नहीं मिल सकी।"
        : "Sorry, I could not find details for that item.";

    return {
      action: "SPEAK_INFO",
      intent: "VIEW_DETAILS",
      message: msg,
      spokenText: msg,
      confidence: "LOW",
    };
  }

  private handleAddToCart(
    entities: any,
    lang: "en" | "hi" | "hinglish"
  ): VoiceActionResult {
    const context = this.contextManager.getContext();

    // Invariant 1: If multiple candidates exist and user says "cart mein daal do" ambiguously without an active product.
    // SAFETY: Pronouns ("isko") MUST also trigger this guard when activeProduct is undefined and multiple candidates exist.
    if (!context.activeProduct && !entities.brand && !entities.productTerm && context.candidateProducts && context.candidateProducts.length > 1) {
      const names = context.candidateProducts.slice(0, 2).map((p) => p.name).join(" or ");
      const msg =
        lang === "hi"
          ? `आप कौन सा प्रोडक्ट कार्ट में जोड़ना चाहते हैं? ${names}?`
          : `Which product would you like to add? ${names}?`;
      return {
        action: "SPEAK_INFO",
        intent: "ADD_TO_CART",
        candidateProducts: context.candidateProducts,
        message: msg,
        spokenText: msg,
        confidence: "MEDIUM",
      };
    }

    // Resolve target
    let product: Product | undefined;
    if (context.activeProduct && (!entities.brand || extractBrandFromProduct(context.activeProduct)?.toLowerCase() === entities.brand.toLowerCase())) {
      product = context.activeProduct;
    } else {
      const { targetProduct, collisionDetected } = this.contextManager.resolveTargetProduct(entities);
      product = targetProduct;

      if (!product && !collisionDetected) {
        const searchRes = this.catalogIndex.search(entities);
        if (searchRes.exactMatch) {
          product = searchRes.exactMatch;
        } else if (searchRes.candidates.length > 0) {
          // SAFETY: Do NOT blindly select candidates[0]. Ask the user to clarify.
          this.contextManager.setCandidates(searchRes.candidates, entities.category, entities.brand);
          const names = searchRes.candidates.slice(0, 3).map((p) => p.name).join(", ");
          const msg =
            lang === "hi"
              ? `कई प्रोडक्ट्स मिले: ${names}. कौन सा कार्ट में जोड़ना है?`
              : `I found multiple products: ${names}. Which one would you like to add to cart?`;
          return {
            action: "DISPLAY_PRODUCTS",
            intent: "ADD_TO_CART",
            candidateProducts: searchRes.candidates.slice(0, 3),
            message: msg,
            spokenText: msg,
            confidence: "MEDIUM",
          };
        }
      }
    }

    if (!product) {
      const msg =
        lang === "hi"
          ? "माफ़ कीजिए, कार्ट में जोड़ने के लिए प्रोडक्ट नहीं मिला।"
          : "Sorry, I could not find that item to add to your cart.";
      return {
        action: "SPEAK_INFO",
        intent: "ADD_TO_CART",
        message: msg,
        spokenText: msg,
        confidence: "LOW",
      };
    }

    // Invariant 2: Out-of-stock rejection
    const totalStock = getProductTotalStock(product);
    if (totalStock <= 0) {
      const msg =
        lang === "hi"
          ? `माफ़ कीजिए, ${product.name} अभी आउट ऑफ स्टॉक है।`
          : `Sorry, ${product.name} is currently out of stock.`;
      return {
        action: "SPEAK_INFO",
        intent: "ADD_TO_CART",
        matchedProduct: product,
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    // Invariant 3: Two-step confirmation prompt
    this.contextManager.setActiveProduct(product);
    this.contextManager.setPendingConfirmation({
      product,
      price: product.price,
      timestamp: Date.now(),
    });

    const msg = formatAddToCartPrompt(product, lang);
    return {
      action: "PROMPT_CONFIRMATION",
      intent: "ADD_TO_CART",
      matchedProduct: product,
      requiresConfirmation: true,
      message: msg,
      spokenText: msg,
      confidence: "HIGH",
    };
  }

  private handleSearchProduct(
    entities: any,
    lang: "en" | "hi" | "hinglish"
  ): VoiceActionResult {
    const searchRes = this.catalogIndex.search(entities);

    // Uncarried brand check
    if (searchRes.suggestedAlternatives && searchRes.suggestedAlternatives.length > 0) {
      const altMsg = formatUncarriedBrandWithAlternatives(
        entities.brand || "that brand",
        entities.category,
        searchRes.suggestedAlternatives,
        lang
      );
      return {
        action: "DISPLAY_PRODUCTS",
        intent: "SEARCH_PRODUCT",
        candidateProducts: searchRes.suggestedAlternatives,
        message: altMsg,
        spokenText: altMsg,
        confidence: "MEDIUM",
      };
    }

    if (searchRes.candidates.length === 0) {
      const msg =
        lang === "hi"
          ? "माफ़ कीजिए, कोई मेल खाने वाला प्रोडक्ट नहीं मिला।"
          : "Sorry, I could not find matching products in our catalog.";
      return {
        action: "SPEAK_INFO",
        intent: "SEARCH_PRODUCT",
        message: msg,
        spokenText: msg,
        confidence: "LOW",
      };
    }

    // Invariant: Do NOT navigate automatically! Display card in drawer.
    this.contextManager.setCandidates(searchRes.candidates, entities.category, entities.brand);

    if (searchRes.exactMatch) {
      this.contextManager.setActiveProduct(searchRes.exactMatch);
      const msg = formatPriceText(searchRes.exactMatch, lang);
      return {
        action: "DISPLAY_PRODUCTS",
        intent: "SEARCH_PRODUCT",
        matchedProduct: searchRes.exactMatch,
        candidateProducts: [searchRes.exactMatch],
        message: msg,
        spokenText: msg,
        confidence: "HIGH",
      };
    }

    const topBatch = searchRes.candidates.slice(0, 3);
    const msg = formatCandidatesSummaryText(topBatch, entities.brand, lang);
    return {
      action: "DISPLAY_PRODUCTS",
      intent: "SEARCH_PRODUCT",
      candidateProducts: topBatch,
      message: msg,
      spokenText: msg,
      confidence: searchRes.confidence,
    };
  }

  private handleSearchCategory(
    entities: any,
    lang: "en" | "hi" | "hinglish"
  ): VoiceActionResult {
    const searchRes = this.catalogIndex.search(entities);

    if (searchRes.candidates.length === 0) {
      const msg =
        lang === "hi"
          ? `माफ़ कीजिए, हमारे पास ${entities.category || "इस कैटेगरी"} में अभी कोई प्रोडक्ट नहीं है।`
          : `Sorry, we do not have items in ${entities.category || "this category"} at the moment.`;
      return {
        action: "SPEAK_INFO",
        intent: "SEARCH_CATEGORY",
        message: msg,
        spokenText: msg,
        confidence: "LOW",
      };
    }

    // Invariant: Display candidates in drawer, NO automatic route navigation!
    this.contextManager.setCandidates(searchRes.candidates, entities.category);
    const topBatch = searchRes.candidates.slice(0, 3);
    const msg = formatCandidatesSummaryText(topBatch, entities.category, lang);

    return {
      action: "DISPLAY_PRODUCTS",
      intent: "SEARCH_CATEGORY",
      candidateProducts: topBatch,
      message: msg,
      spokenText: msg,
      confidence: "HIGH",
    };
  }

  private handleUnknown(lang: "en" | "hi" | "hinglish"): VoiceActionResult {
    const msg =
      lang === "hi"
        ? "आप क्या देखना चाहते हैं? आप काजल, सीरम या चूड़ियों के बारे में पूछ सकते हैं।"
        : "What would you like me to show? Try asking for Kajal, Serum, or Bangles.";
    return {
      action: "SPEAK_INFO",
      intent: "UNKNOWN",
      message: msg,
      spokenText: msg,
      confidence: "LOW",
    };
  }
}
