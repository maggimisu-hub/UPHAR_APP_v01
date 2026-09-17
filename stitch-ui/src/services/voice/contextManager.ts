/**
 * Multi-Turn Conversation Context State Machine for Uphar Voice Assistant
 * 
 * Enforces strict anti-collision rules, pronoun resolution, relative modifier
 * scoping, ordinal selection, and pending cart confirmation management.
 */

import { Product } from "../../types";
import { ConversationContext, PendingCartAction, VoiceEntitySet, VoiceIntentType } from "./types";
import { extractBrandFromProduct } from "./catalogIndex";
import { DEFAULT_VOICE_MATCH_CONFIG } from "./config";

export class ConversationContextManager {
  private context: ConversationContext;

  constructor(initialContext?: Partial<ConversationContext>) {
    this.context = {
      paginationOffset: 0,
      timestamp: Date.now(),
      ...initialContext,
    };
  }

  public getContext(): ConversationContext {
    return { ...this.context };
  }

  public reset(): void {
    this.context = {
      paginationOffset: 0,
      timestamp: Date.now(),
    };
  }

  public setActiveProduct(product: Product): void {
    this.context.activeProduct = product;
    this.context.candidateBrand = extractBrandFromProduct(product);
    this.context.timestamp = Date.now();
  }

  public setCandidates(products: Product[], category?: string, brand?: string): void {
    this.context.candidateProducts = products;
    this.context.candidateCategory = category;
    this.context.candidateBrand = brand;
    this.context.paginationOffset = 0;
    this.context.timestamp = Date.now();
  }

  public setPendingConfirmation(action: PendingCartAction): void {
    this.context.pendingConfirmation = action;
    this.context.timestamp = Date.now();
  }

  public clearPendingConfirmation(): void {
    delete this.context.pendingConfirmation;
  }

  public setLastIntent(intent: VoiceIntentType): void {
    this.context.lastIntent = intent;
  }

  /**
   * Resolves target product based on utterance entities and conversation context.
   * 
   * Strict anti-collision invariant:
   * If utterance mentions an explicit brand that differs from the activeProduct's brand,
   * activeProduct is completely disregarded!
   */
  public resolveTargetProduct(entities: VoiceEntitySet): {
    targetProduct?: Product;
    fromContext: boolean;
    collisionDetected: boolean;
  } {
    const { activeProduct, candidateProducts } = this.context;

    // 1. Check Brand Collision
    if (entities.brand && activeProduct) {
      const activeBrand = extractBrandFromProduct(activeProduct);
      if (activeBrand && activeBrand.toLowerCase() !== entities.brand.toLowerCase()) {
        // Query mentions a different brand; ignore active product to prevent collision
        return { targetProduct: undefined, fromContext: false, collisionDetected: true };
      }
    }

    // 2. Direct Pronoun ("isko", "this", "it", "yeh")
    if (entities.isDirectReference && activeProduct) {
      return { targetProduct: activeProduct, fromContext: true, collisionDetected: false };
    }

    // 3. Ordinal Selection ("first one", "second", "1st", "2nd")
    if (entities.ordinalIndex !== undefined && candidateProducts && candidateProducts.length > 0) {
      const selected = candidateProducts[entities.ordinalIndex];
      if (selected) {
        return { targetProduct: selected, fromContext: true, collisionDetected: false };
      }
    }

    // 4. Relative Modifier Selection ("VLCC wala", "Charcoal wala")
    if (entities.relativeModifier && candidateProducts && candidateProducts.length > 0) {
      if (entities.brand) {
        const found = candidateProducts.find((p) => {
          const b = extractBrandFromProduct(p);
          return b?.toLowerCase() === entities.brand?.toLowerCase();
        });
        if (found) {
          return { targetProduct: found, fromContext: true, collisionDetected: false };
        }
      }

      if (entities.productTerm) {
        const term = entities.productTerm.toLowerCase();
        const found = candidateProducts.find((p) => p.name.toLowerCase().includes(term));
        if (found) {
          return { targetProduct: found, fromContext: true, collisionDetected: false };
        }
      }
    }

    // 5. Default fallback to activeProduct if no conflicting brand/category is present
    if (!entities.brand && !entities.category && !entities.productTerm && activeProduct) {
      return { targetProduct: activeProduct, fromContext: true, collisionDetected: false };
    }

    return { targetProduct: undefined, fromContext: false, collisionDetected: false };
  }

  /**
   * Paginates candidate pool ("aur dikhao").
   */
  public paginateCandidates(): {
    currentBatch: Product[];
    hasMore: boolean;
    exhausted: boolean;
  } {
    const candidates = this.context.candidateProducts || [];
    const pageSize = DEFAULT_VOICE_MATCH_CONFIG.MAX_CANDIDATES_PER_PAGE;
    const nextOffset = this.context.paginationOffset + pageSize;

    if (nextOffset >= candidates.length) {
      return {
        currentBatch: [],
        hasMore: false,
        exhausted: true,
      };
    }

    this.context.paginationOffset = nextOffset;
    const currentBatch = candidates.slice(nextOffset, nextOffset + pageSize);
    const hasMore = nextOffset + pageSize < candidates.length;

    return {
      currentBatch,
      hasMore,
      exhausted: false,
    };
  }
}
