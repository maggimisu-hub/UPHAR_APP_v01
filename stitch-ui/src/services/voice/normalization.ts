/**
 * Text Normalization & Transliteration Engine for Uphar Voice Assistant
 */

const DEVANAGARI_TRANSLITERATION_MAP: Record<string, string> = {
  "काजल": "kajal",
  "सीरम": "serum",
  "कंगन": "kangan",
  "चूड़ी": "choodi",
  "चूड़ियां": "choodi",
  "झुमका": "jhumka",
  "झुमके": "jhumka",
  "हार": "haar",
  "वीएलसीसी": "vlcc",
  "मामाअर्थ": "mamaearth",
  "लक्मे": "lakme",
  "फियामा": "fiama",
  "दिखाओ": "dikhao",
  "दिखाइए": "dikhao",
  "खोलो": "kholo",
  "खोल": "kholo",
  "खोल दो": "khol do",
  "कितने": "kitne",
  "दाम": "daam",
  "मूल्य": "price",
  "स्टॉक": "stock",
  "उपलब्ध": "available",
  "कार्ट": "cart",
  "डालो": "daalo",
  "डाल दो": "daal do",
  "हां": "haan",
  "हाँ": "haan",
  "नहीं": "nahi",
  "रद्द": "cancel",
  "पहला": "pehla",
  "दूसरा": "doosra",
  "तीसरा": "teesra",
  "और": "aur",
  "आगे": "aage",
  "यह": "yeh",
  "ये": "yeh",
  "इसको": "isko",
  "इसका": "iska",
  "इसके": "iske",
  "वाला": "wala",
  "वाली": "wali",
  "वाले": "wale",
  "चाहिए": "chahiye",
  "लेना है": "lena hai",
  "डिटेल्स": "details",
  "बारे में": "baare mein",
};


/**
 * Checks if string contains Devanagari Unicode characters (0x0900 - 0x097F).
 */
export function hasDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Transliterates common Devanagari Hindi words to Romanized equivalents.
 */
export function transliterateDevanagari(text: string): string {
  let result = text;
  for (const [dev, lat] of Object.entries(DEVANAGARI_TRANSLITERATION_MAP)) {
    result = result.replace(new RegExp(dev, "g"), lat);
  }
  return result;
}

/**
 * Detects whether the query is primarily English, Hindi, or Hinglish.
 */
export function detectLanguage(text: string): "en" | "hi" | "hinglish" {
  if (hasDevanagari(text)) {
    return "hi";
  }

  const hinglishMarkers = [
    "dikhao",
    "kholo",
    "chahiye",
    "wala",
    "wali",
    "wale",
    "daal",
    "batao",
    "kitne",
    "daam",
    "hai",
    "kya",
    "isko",
    "iska",
    "iske",
    "pehla",
    "doosra",
    "haan",
    "nahi",
    "aur",
  ];

  const lower = text.toLowerCase();
  const hasHinglish = hinglishMarkers.some((m) => new RegExp(`\\b${m}\\b`, "i").test(lower));
  if (hasHinglish) {
    return "hinglish";
  }

  return "en";
}

/**
 * Normalizes input text: lowercases, transliterates Devanagari, removes punctuation,
 * cleans extra spaces.
 */
export function normalizeQuery(text: string): string {
  if (!text) return "";

  let cleaned = text.trim();

  // Transliterate Devanagari tokens if present
  if (hasDevanagari(cleaned)) {
    cleaned = transliterateDevanagari(cleaned);
  }

  // Lowercase
  cleaned = cleaned.toLowerCase();

  // Remove common punctuation except % or hyphens inside words
  cleaned = cleaned.replace(/[.,?!;:()[\]{}"'\\/]/g, " ");

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}
