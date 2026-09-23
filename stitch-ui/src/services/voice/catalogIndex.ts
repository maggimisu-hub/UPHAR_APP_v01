/**
 * In-Memory Catalog Index & Constraint Engine for Uphar Voice Assistant
 * 
 * Enforces hard brand and category constraints, availability calculations,
 * and tunable candidate scoring against Storefront Products.
 */

import { Product } from "../../types";
import { VoiceMatchConfig, DEFAULT_VOICE_MATCH_CONFIG } from "./config";
import { VoiceEntitySet } from "./types";
import { CANONICAL_BRANDS, CANONICAL_CATEGORIES } from "./lexicon";

export interface ScoredProduct {
  product: Product;
  score: number;
  brandMatch: boolean;
  categoryMatch: boolean;
  inStock: boolean;
  totalStock: number;
}

export interface SearchResolution {
  exactMatch?: Product;
  candidates: Product[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  isTie: boolean;
  suggestedAlternatives?: Product[];
}

/**
 * Calculates total stock for a product across variants.
 */
export function getProductTotalStock(product: Product): number {
  if (!product.variantStock) return 0;
  return Object.values(product.variantStock).reduce((sum, qty) => sum + (qty || 0), 0);
}

/**
 * Identifies brand from product name based on canonical list.
 */
export function extractBrandFromProduct(product: Product): string | undefined {
  const nameLower = product.name.toLowerCase();
  for (const b of CANONICAL_BRANDS) {
    if (nameLower.includes(b.canonical.toLowerCase())) {
      return b.canonical;
    }
    for (const alias of b.aliases) {
      if (nameLower.includes(alias)) {
        return b.canonical;
      }
    }
  }
  return undefined;
}

/**
 * Identifies category from product attributes and name.
 */
export function extractCategoryFromProduct(product: Product): string | undefined {
  const nameLower = product.name.toLowerCase();
  for (const c of CANONICAL_CATEGORIES) {
    if (nameLower.includes(c.canonical.toLowerCase())) {
      return c.canonical;
    }
    for (const alias of c.aliases) {
      if (nameLower.includes(alias)) {
        return c.canonical;
      }
    }
  }

  if (product.product_type === "bangles") return "Bangles";
  if (product.product_type === "jewellery") return "Jewellery";
  return undefined;
}

/**
 * In-Memory Catalog Index Engine
 */
export class CatalogIndex {
  private products: Product[] = [];
  private config: VoiceMatchConfig;

  constructor(products: Product[] = [], config: VoiceMatchConfig = DEFAULT_VOICE_MATCH_CONFIG) {
    this.products = products;
    this.config = config;
  }

  public setProducts(products: Product[]): void {
    this.products = products;
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public setConfig(config: VoiceMatchConfig): void {
    this.config = config;
  }

  /**
   * Searches the catalog enforcing hard constraints on brand and category.
   */
  public search(entities: VoiceEntitySet): SearchResolution {
    if (this.products.length === 0) {
      return { candidates: [], confidence: "LOW", isTie: false };
    }

    const { brand, category, productTerm } = entities;

    // Filter by Hard Constraints
    let filtered = this.products;

    if (brand) {
      filtered = filtered.filter((p) => {
        const pBrand = extractBrandFromProduct(p);
        return pBrand?.toLowerCase() === brand.toLowerCase();
      });

      // If user queried a specific brand and we carry zero items of that brand:
      if (filtered.length === 0) {
        // Suggest alternatives from the same category if category was specified
        let alternatives: Product[] = [];
        if (category) {
          alternatives = this.products
            .filter((p) => {
              const pCat = extractCategoryFromProduct(p);
              return pCat?.toLowerCase() === category.toLowerCase();
            })
            .slice(0, 3);
        }
        return {
          candidates: [],
          confidence: "LOW",
          isTie: false,
          suggestedAlternatives: alternatives,
        };
      }
    }

    if (category) {
      filtered = filtered.filter((p) => {
        const pCat = extractCategoryFromProduct(p);
        return (
          pCat?.toLowerCase() === category.toLowerCase() ||
          p.name.toLowerCase().includes(category.toLowerCase()) ||
          p.description?.toLowerCase().includes(category.toLowerCase())
        );
      });
    }

    // Score remaining candidates
    const scored: ScoredProduct[] = filtered.map((p) => {
      let score = 0;
      const nameLower = p.name.toLowerCase();
      const totalStock = getProductTotalStock(p);
      const inStock = totalStock > 0;

      // Brand Bonus
      const isBrandMatch = brand && extractBrandFromProduct(p)?.toLowerCase() === brand.toLowerCase();
      if (isBrandMatch) {
        score += this.config.BRAND_MATCH_BONUS;
      }

      // Category Bonus
      const isCategoryMatch = category && (nameLower.includes(category.toLowerCase()) || extractCategoryFromProduct(p)?.toLowerCase() === category.toLowerCase());
      if (isCategoryMatch) {
        score += this.config.CATEGORY_MATCH_BONUS;
      }

      // Compound Brand + Category Match Bonus
      if (isBrandMatch && isCategoryMatch) {
        score += this.config.BRAND_CATEGORY_COMPOUND_BONUS;
      }

      // Exact Name / Term Bonus
      if (productTerm) {
        const termTokens = productTerm.toLowerCase().split(" ").filter(Boolean);
        for (const t of termTokens) {
          if (nameLower.includes(t)) {
            score += this.config.TOKEN_MATCH_BONUS;
          }
        }
      }

      // Exact full phrase match bonus
      if (productTerm && nameLower.includes(productTerm.toLowerCase())) {
        score += this.config.EXACT_NAME_BONUS;
      }

      // In stock priority
      if (inStock) {
        score += 10;
      }

      return {
        product: p,
        score,
        brandMatch: !!brand,
        categoryMatch: !!category,
        inStock,
        totalStock,
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      return { candidates: [], confidence: "LOW", isTie: false };
    }

    const top = scored[0];
    const topScore = top.score;

    // Check for ties in top candidates
    let isTie = false;
    if (scored.length > 1) {
      const secondScore = scored[1].score;
      if (topScore > 0 && (topScore - secondScore) / topScore <= this.config.TOP_TWO_TIE_RATIO) {
        isTie = true;
      }
    }

    // Determine confidence
    let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (topScore >= this.config.HIGH_CONFIDENCE_THRESHOLD && !isTie) {
      confidence = "HIGH";
    } else if (topScore >= this.config.MEDIUM_CONFIDENCE_THRESHOLD || isTie) {
      confidence = "MEDIUM";
    }

    const candidateProducts = scored.map((s) => s.product);

    return {
      exactMatch: confidence === "HIGH" ? top.product : undefined,
      candidates: candidateProducts,
      confidence,
      isTie,
    };
  }
}
