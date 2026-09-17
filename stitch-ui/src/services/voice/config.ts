/**
 * Tunable Matching Configuration for Uphar Voice Assistant
 * 
 * Note: The numeric threshold values below are INITIAL TUNING PARAMETERS.
 * They are validated against the catalog fixtures and test suite, and can be
 * tuned without altering the matching engine logic.
 */

export interface VoiceMatchConfig {
  HIGH_CONFIDENCE_THRESHOLD: number;      // Initial: 160
  MEDIUM_CONFIDENCE_THRESHOLD: number;    // Initial: 80
  TOP_TWO_TIE_RATIO: number;              // Initial: 0.15 (15% difference)
  EXACT_NAME_BONUS: number;               // Initial: 200
  BRAND_MATCH_BONUS: number;              // Initial: 50
  CATEGORY_MATCH_BONUS: number;           // Initial: 40
  BRAND_CATEGORY_COMPOUND_BONUS: number;  // Initial: 80
  TOKEN_MATCH_BONUS: number;              // Initial: 25
  SYNONYM_BONUS: number;                  // Initial: 10
  MAX_CANDIDATES_PER_PAGE: number;        // Max items per speech/drawer card page
}

export const DEFAULT_VOICE_MATCH_CONFIG: VoiceMatchConfig = {
  HIGH_CONFIDENCE_THRESHOLD: 160,
  MEDIUM_CONFIDENCE_THRESHOLD: 80,
  TOP_TWO_TIE_RATIO: 0.15,
  EXACT_NAME_BONUS: 200,
  BRAND_MATCH_BONUS: 50,
  CATEGORY_MATCH_BONUS: 40,
  BRAND_CATEGORY_COMPOUND_BONUS: 80,
  TOKEN_MATCH_BONUS: 25,
  SYNONYM_BONUS: 10,
  MAX_CANDIDATES_PER_PAGE: 3,
};
