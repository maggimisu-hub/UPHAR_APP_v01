import type { Product } from "../types";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export type AssistantLanguage = "en" | "hi" | "hinglish";

export type ToolResult = {
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
  pendingCartItem?: {
    product: Product;
    size: string;
    quantity: number;
  };
  matchedProduct?: Product;
  candidateProducts?: Product[];
  disambiguationOptions?: DisambiguationOption[];
  constraints?: SearchConstraints;
};

export type SpeechRecognitionEvent = any;

export type ParsedIntentType =
  | "CONFIRM"
  | "CANCEL"
  | "ADD_TO_CART"
  | "NEW_ARRIVALS"
  | "DETAILS"
  | "SEARCH";

export type ParsedIntent = {
  type: ParsedIntentType;
  rawQuery: string;
  normalizedQuery: string;
  extractedProductTerm: string;
  constraints: SearchConstraints;
};

export type SearchConstraints = {
  cleanProductTerm: string;
  minPrice?: number;
  maxPrice?: number;
};

export type DisambiguationOption = {
  id: string;
  label: string;
  query: string;
};

// ─────────────────────────────────────────────────────
// Centralized Multilingual Response Templates
// ─────────────────────────────────────────────────────

type ResponseKey =
  | "welcome"
  | "search_single"
  | "search_multiple"
  | "search_none"
  | "search_filtered_single"
  | "search_filtered_multiple"
  | "search_filtered_none"
  | "detail"
  | "new_arrivals"
  | "new_arrivals_none"
  | "cart_confirm"
  | "cart_added"
  | "cart_out_of_stock"
  | "cart_which_product"
  | "cart_multiple"
  | "cart_earlier"
  | "cancel"
  | "cancel_button"
  | "confirm_button"
  | "detail_not_found"
  | "confirm_no_pending"
  | "cancel_no_pending"
  | "disambiguate_options";

const RESPONSES: Record<AssistantLanguage, Partial<Record<ResponseKey, string>>> = {
  en: {
    welcome: "Namaste! I am your Uphar Voice Shopping Assistant. Ask me about products, discounts, new arrivals, or stock!",
    search_single: "I found 1 product in store: {name} for {price} [{stock}]. Would you like details or should I add it to your cart?",
    search_multiple: "I found {count} matching products: {list}. Which one would you like details for or to add to your cart?",
    search_none: "I searched for \"{term}\", but no matching products were found in our store currently. Try asking for kajal, serum, or bangles!",
    detail: "{name} is priced at ₹{price}{mrp}{discount}. Stock: {stockSummary}. Return policy: {returnPolicy}.",
    detail_not_found: "I could not find details for \"{term}\". Please tell me which product you are looking for!",
    new_arrivals: "Our latest new arrivals include: {list}. Which one would you like to view or add to your cart?",
    new_arrivals_none: "Currently there are no items flagged as new arrivals.",
    cart_confirm: "I found {name} ({size}) for ₹{price}. Would you like me to add 1 item to your cart?",
    cart_added: "Added {qty} unit(s) of {name} ({size}) to your cart!",
    cart_out_of_stock: "Sorry, {name} ({size}) is currently out of stock.",
    cart_which_product: "Which product would you like to add to your cart? Try saying 'Add Mamaearth Kajal to cart' or search for a product first!",
    cart_multiple: "I found {count} matching products: {list}. Which specific item would you like to add to your cart?",
    cart_earlier: "Which item from your earlier search would you like to add? {list}.",
    cancel: "Cancelled adding item to cart. What else can I help you find?",
    cancel_button: "Cancel",
    confirm_button: "Yes, Add to Cart",
    confirm_no_pending: "I don't have any pending item to confirm. What would you like to search or add?",
    cancel_no_pending: "Nothing to cancel. What would you like to look for?",
  },
  hi: {
    welcome: "नमस्ते! मैं आपका उपहार वॉइस शॉपिंग असिस्टेंट हूँ। प्रोडक्ट, डिस्काउंट, नई चीज़ें, या स्टॉक के बारे में पूछें!",
    search_single: "स्टोर में 1 प्रोडक्ट मिला: {name} — {price} [{stock}]। क्या आप डिटेल चाहते हैं या कार्ट में डालूँ?",
    search_multiple: "{count} प्रोडक्ट मिले: {list}। किसकी डिटेल चाहिए या कार्ट में डालना है?",
    search_none: "मैंने \"{term}\" खोजा, लेकिन कोई प्रोडक्ट नहीं मिला। काजल, सीरम, या बैंगल्स के बारे में पूछें!",
    detail: "{name} की कीमत ₹{price}{mrp}{discount} है। स्टॉक: {stockSummary}। रिटर्न पॉलिसी: {returnPolicy}।",
    detail_not_found: "\"{term}\" के बारे में जानकारी नहीं मिली। कृपया बताएं कि आप कौनसा प्रोडक्ट ढूंढ रहे हैं!",
    new_arrivals: "हमारी नई चीज़ों में शामिल हैं: {list}। कौनसा देखना है या कार्ट में डालना है?",
    new_arrivals_none: "अभी कोई नई चीज़ उपलब्ध नहीं है।",
    cart_confirm: "{name} ({size}) ₹{price} में मिला। क्या मैं 1 आइटम कार्ट में डालूँ?",
    cart_added: "{name} ({size}) का {qty} आइटम कार्ट में डाल दिया!",
    cart_out_of_stock: "माफ़ी, {name} ({size}) अभी स्टॉक में नहीं है।",
    cart_which_product: "कौनसा प्रोडक्ट कार्ट में डालना है? 'Mamaearth Kajal डालो' बोलें या पहले कोई प्रोडक्ट खोजें!",
    cart_multiple: "{count} प्रोडक्ट मिले: {list}। कौनसा कार्ट में डालना है?",
    cart_earlier: "पहले की खोज में से कौनसा डालना है? {list}।",
    cancel: "कार्ट में डालना रद्द किया। और क्या ढूंढना है?",
    cancel_button: "रद्द करें",
    confirm_button: "हाँ, कार्ट में डालें",
    confirm_no_pending: "कोई पेंडिंग आइटम नहीं है। क्या खोजना या डालना चाहते हैं?",
    cancel_no_pending: "रद्द करने को कुछ नहीं है। क्या ढूंढना चाहते हैं?",
  },
  hinglish: {
    welcome: "Namaste! Main aapka Uphar Voice Shopping Assistant hoon. Products, discounts, new arrivals, ya stock ke baare mein poocho!",
    search_single: "Store mein 1 product mila: {name} — {price} [{stock}]. Details chahiye ya cart mein daaloon?",
    search_multiple: "{count} matching products mile: {list}. Kiska detail chahiye ya cart mein daalna hai?",
    search_none: "Maine \"{term}\" search kiya, par koi product nahi mila. Kajal, serum, ya bangles ke baare mein poocho!",
    detail: "{name} ki price ₹{price}{mrp}{discount} hai. Stock: {stockSummary}. Return policy: {returnPolicy}.",
    detail_not_found: "\"{term}\" ki details nahi mili. Bataiye kaunsa product dhundh rahe ho!",
    new_arrivals: "Hamare latest new arrivals: {list}. Kaunsa dekhna hai ya cart mein daalna hai?",
    new_arrivals_none: "Abhi koi new arrivals nahi hain.",
    cart_confirm: "{name} ({size}) ₹{price} mein mila. Kya main 1 item cart mein daaloon?",
    cart_added: "{name} ({size}) ka {qty} item cart mein daal diya!",
    cart_out_of_stock: "Sorry, {name} ({size}) abhi out of stock hai.",
    cart_which_product: "Kaunsa product cart mein daalna hai? 'Mamaearth Kajal add karo' bolo ya pehle koi product search karo!",
    cart_multiple: "{count} matching products mile: {list}. Kaunsa cart mein daalna hai?",
    cart_earlier: "Pehle ki search mein se kaunsa add karna hai? {list}.",
    cancel: "Cart mein daalna cancel kiya. Aur kya dhundhna hai?",
    cancel_button: "Cancel",
    confirm_button: "Haan, Cart mein daalo",
    confirm_no_pending: "Koi pending item nahi hai. Kya search ya add karna chahte ho?",
    cancel_no_pending: "Cancel karne ko kuch nahi hai. Kya dhundhna chahte ho?",
  },
};

const RESPONSE_OVERRIDES: Record<AssistantLanguage, Partial<Record<ResponseKey, string>>> = {
  en: {
    welcome: "Namaste! I am your Uphar Voice Shopping Assistant. Ask me about products, discounts, new arrivals, or stock.",
    search_none: "I searched for \"{term}\", but no matching products were found in our store currently. Try asking for kajal, serum, or bangles.",
    search_filtered_single: "I found 1 product for {term} within your price range: {name} for {price} [{stock}].",
    search_filtered_multiple: "I found {count} matching products for {term} within your price range: {list}. Which one would you like details for or to add to your cart?",
    search_filtered_none: "I found products for {term}, but none matched your price range.",
    detail: "{name} is priced at ₹{price}{mrp}{discount}. Stock: {stockSummary}. Return policy: {returnPolicy}.",
    detail_not_found: "I could not find details for \"{term}\". Please tell me which product you are looking for.",
    cart_confirm: "I found {name} ({size}) for ₹{price}. Would you like me to add 1 item to your cart?",
    cart_added: "Added {qty} unit(s) of {name} ({size}) to your cart.",
    cart_which_product: "Which product would you like to add to your cart? Try saying 'Add Mamaearth Kajal to cart' or search for a product first.",
    disambiguate_options: "I found multiple types for {term}: {options}. Which one do you want?",
  },
  hi: {
    welcome: "नमस्ते! मैं आपका Uphar Voice Shopping Assistant हूँ। प्रोडक्ट, डिस्काउंट, नई चीज़ें, या स्टॉक के बारे में पूछें।",
    search_filtered_single: "{term} के लिए आपकी प्राइस रेंज में 1 प्रोडक्ट मिला: {name} - {price} [{stock}]।",
    search_filtered_multiple: "{term} के लिए आपकी प्राइस रेंज में {count} प्रोडक्ट मिले: {list}। किसकी डिटेल चाहिए?",
    search_filtered_none: "मुझे {term} के प्रोडक्ट मिले, लेकिन आपकी प्राइस रेंज में कोई मैच नहीं मिला।",
    disambiguate_options: "{term} के लिए मुझे कई टाइप मिले: {options}। कौनसा चाहिए?",
  },
  hinglish: {
    welcome: "Namaste! Main aapka Uphar Voice Shopping Assistant hoon. Products, discounts, new arrivals, ya stock ke baare mein poocho.",
    search_none: "Maine \"{term}\" search kiya, par koi product nahi mila. Kajal, serum, ya bangles ke baare mein poocho.",
    search_filtered_single: "{term} ke liye aapki price range mein 1 product mila: {name} - {price} [{stock}].",
    search_filtered_multiple: "{term} ke liye aapki price range mein {count} matching products mile: {list}. Kiska detail chahiye?",
    search_filtered_none: "Maine {term} ke products dhoondhe, par aapki price range mein koi match nahi mila.",
    detail: "{name} ki price ₹{price}{mrp}{discount} hai. Stock: {stockSummary}. Return policy: {returnPolicy}.",
    detail_not_found: "\"{term}\" ki details nahi mili. Bataiye kaunsa product dhoondh rahe ho.",
    cart_confirm: "{name} ({size}) ₹{price} mein mila. Kya main 1 item cart mein daaloon?",
    cart_added: "{name} ({size}) ka {qty} item cart mein daal diya.",
    disambiguate_options: "{term} ke liye multiple types mile: {options}. Kaunsa chahiye?",
  },
};

/**
 * Get a localized response string with template variable substitution.
 */
export function getLocalizedResponse(
  key: ResponseKey,
  lang: AssistantLanguage,
  vars?: Record<string, string | number>
): string {
  let template =
    RESPONSE_OVERRIDES[lang]?.[key] ||
    RESPONSES[lang]?.[key] ||
    RESPONSE_OVERRIDES.en[key] ||
    RESPONSES.en[key] ||
    "";
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      template = template.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return template;
}

// ─────────────────────────────────────────────────────
// Synonym / Category keyword dictionary
// ─────────────────────────────────────────────────────

const SYNONYM_MAP: Record<string, string[]> = {
  kajal: ["kajal", "kohl", "eye", "eyeliner", "charcoal"],
  serum: ["serum", "vitamin c", "face", "derma"],
  bangles: ["bangle", "bangles", "bridal", "jewellery"],
  bangle: ["bangle", "bangles", "bridal", "jewellery"],
  jewellery: ["jewellery", "jewelry", "necklace", "earrings", "jhumka", "choker", "bangles"],
  jewelry: ["jewellery", "jewelry", "necklace", "earrings", "jhumka", "choker", "bangles"],
  necklace: ["necklace", "choker", "set", "bridal", "jewellery"],
  earrings: ["earrings", "earring", "jhumka", "chandbali", "drops", "studs", "jewellery"],
  earring: ["earrings", "earring", "jhumka", "chandbali", "drops", "studs", "jewellery"],
  jhumka: ["jhumka", "jhumki", "earrings", "jewellery"],
  choker: ["choker", "necklace", "set", "jewellery"],
  shower: ["shower", "gel", "shower gel", "body wash", "fiama"],
  mist: ["mist", "body mist", "perfume", "vanilla", "aqualogica"],
  cosmetics: ["cosmetics", "kajal", "serum", "mist", "shower gel"],
  derma: ["derma", "the derma co", "vitamin c"],
  mamaearth: ["mamaearth", "charcoal"],
  aqualogica: ["aqualogica", "vanilla", "mist"],
  fiama: ["fiama", "shower gel", "berry"],
};

// ─────────────────────────────────────────────────────
// Multilingual Filler Phrases (longest match first)
// ─────────────────────────────────────────────────────

const FILLER_PHRASES = [
  // English fillers
  "show me the", "show me a", "show me an", "show me",
  "do you have the", "do you have a", "do you have an", "do you have",
  "you have the", "you have a", "you have",
  "kindly add to the cart", "kindly add to cart", "kindly add the", "kindly add",
  "please add to the cart", "please add to cart", "please add the", "please add",
  "add to the cart", "add to cart", "add to my cart", "add to bag", "add to my bag",
  "add the", "add a", "add an", "add",
  "can you show", "can you find", "can you add", "can you",
  "i want to buy", "i want the", "i want a", "i want",
  "looking for the", "looking for a", "looking for",
  "search for", "search",
  "what is the price of", "price of", "discount of",
  "tell me about",
  "is it returnable", "is it in stock",
  "check stock for", "check stock of",

  // Hindi / Hinglish fillers
  "mujhe dikhaiye", "mujhe dikhao", "mujhe dikhaye",
  "dikhaiye", "dikhao", "dikhaye",
  "isko cart mein add karo", "isko cart mein daal do", "isko cart mein daalo",
  "isko add karo", "isko add kar do",
  "cart mein daal do", "cart mein daalo", "cart mein add karo",
  "bag mein daal do", "bag mein daalo",
  "mujhe chahiye", "chahiye",
  "kya hai", "kya milega", "hai kya",
  "kitne ka hai", "kitne mein milega", "kitne mein hai",
  "kya price hai", "price kya hai", "keemat kya hai",
  "stock mein hai kya", "available hai kya",
  "wapas ho sakta hai kya", "return ho sakta hai kya",
  "kya ye returnable hai",
];

// ─────────────────────────────────────────────────────
// Multilingual Confirm / Cancel Keywords
// ─────────────────────────────────────────────────────

const CONFIRM_WORDS = new Set([
  // English
  "yes", "yep", "yeah", "sure", "confirm", "ok", "okay", "add it", "do it", "proceed",
  // Hindi / Hinglish
  "haan", "ha", "haa", "ji", "ji haan",
  "theek hai", "thik hai", "theek", "thik",
  "kar do", "kardo", "kar de",
  "daal do", "daaldo", "daal de", "daalde",
  "bilkul", "zaroor", "zarur",
]);

const CONFIRM_PREFIXES = [
  "yes ", "sure ", "confirm ", "haan ", "ha ", "theek ", "thik ", "bilkul ", "zaroor ",
];

const CANCEL_WORDS = new Set([
  // English
  "no", "nope", "cancel", "don't", "stop", "nevermind", "never mind",
  // Hindi / Hinglish
  "nahi", "nhi", "nahin", "na", "mat",
  "mat karo", "mat kar",
  "rehne do", "rehne de", "chhodo", "chhod do",
  "band karo", "band kar do", "band",
  "ruk", "ruko",
]);

const CANCEL_PREFIXES = ["no ", "cancel ", "nahi ", "nhi ", "mat "];

// ─────────────────────────────────────────────────────
// Multilingual Intent Detection Keywords
// ─────────────────────────────────────────────────────

const ADD_TO_CART_TRIGGERS_EN = [
  { word: "add", requires: ["cart", "bag", "buy"] },
];

const ADD_TO_CART_TRIGGERS_MULTI = [
  "cart mein", "bag mein",
  "daal do", "daaldo", "daal de",
  "add karo", "add kar do",
  "kharid", "khareedna", "khareed lo",
  "isko add", "isko daal",
];

const NEW_ARRIVAL_TRIGGERS = [
  // English
  "new arrival", "new product", "latest", "what's new",
  // Hindi / Hinglish
  "naye", "naya", "nayi", "nayi cheezein", "nayi cheez",
  "naya product", "naye product", "naya kya aaya",
];

const DETAIL_TRIGGERS = [
  // English
  "price", "discount", "mrp", "return", "stock", "cost", "detail", "how much", "available",
  // Hindi / Hinglish
  "kitna", "kitne", "kitni",
  "keemat", "kimat", "daam",
  "wapas", "wapsi",
  "stock mein", "available hai",
];

// ─────────────────────────────────────────────────────
// Devanagari-to-Roman Algorithmic Transliterator
// Unlimited: works for ANY Hindi word, not just known products.
// ─────────────────────────────────────────────────────

// Devanagari consonant map (base characters → Roman phonetic)
const DEVANAGARI_CONSONANTS: Record<string, string> = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "f", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v",
  "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "क़": "q", "ख़": "kh", "ग़": "g", "ज़": "z", "फ़": "f", "ड़": "r", "ढ़": "rh",
};

// Devanagari vowel diacritics (matras → Roman phonetic)
const DEVANAGARI_MATRAS: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
  "ं": "n", "ँ": "n", "ः": "h",
  "\u094D": "",  // Halant (virama) — suppresses inherent 'a'
};

// Standalone Devanagari vowels
const DEVANAGARI_VOWELS: Record<string, string> = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऋ": "ri",
};

// Devanagari digits
const DEVANAGARI_DIGITS: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

// High-priority word-level overrides for common product/brand terms
// where algorithmic transliteration may produce a slightly different spelling.
// These take priority over the character-level converter.
const DEVANAGARI_WORD_OVERRIDES: Record<string, string> = {
  "काजल": "kajal",
  "सीरम": "serum",
  "बैंगल्स": "bangles",
  "चूड़ियाँ": "bangles",
  "चूड़ी": "bangles",
  "झुमका": "jhumka",
  "झुमके": "jhumka",
  "हार": "necklace",
  "नेकलेस": "necklace",
  "चोकर": "choker",
  "ज्वेलरी": "jewellery",
  "गहने": "jewellery",
  "शावर": "shower",
  "जेल": "gel",
  "मिस्ट": "mist",
  "परफ्यूम": "perfume",
  "लिपस्टिक": "lipstick",
  "क्रीम": "cream",
  "टोनर": "toner",
  "बिंदी": "bindi",
  "पायल": "payal",
  "ब्रेसलेट": "bracelet",
  "ममाअर्थ": "mamaearth",
  "मामाअर्थ": "mamaearth",
  "डर्मा": "derma",
  "फियामा": "fiama",
  "एक्वालोजिका": "aqualogica",
  "वीएलसीसी": "vlcc",
  "डॉट": "dot",
  "की": "key",
  // Confirm/Cancel words in Devanagari → exact Roman matches
  "हाँ": "haan",
  "हां": "haan",
  "हा": "ha",
  "जी": "ji",
  "बिल्कुल": "bilkul",
  "ज़रूर": "zaroor",
  "जरूर": "zaroor",
  "ठीक": "theek",
  "नहीं": "nahi",
  "नही": "nahi",
  "ना": "na",
  "मत": "mat",
  "रुको": "ruko",
  "रुक": "ruk",
  "बंद": "band",
  "छोड़ो": "chhodo",
  "रहने": "rehne",
};

// Devanagari filler words (action verbs, pronouns, postpositions etc.)
const DEVANAGARI_FILLERS = new Set([
  "मुझे", "मैं", "हमें", "कृपया", "ज़रा", "जरा",
  "दिखाओ", "दिखाइए", "दिखाइये", "दिखा", "दिखाये",
  "खरीदनी", "खरीदना", "खरीदो", "खरीद",
  "चाहिए", "चाहिये", "लेना", "लो", "दो", "दे",
  "है", "हैं", "हो", "था", "थी",
  "का", "की", "के", "को", "से", "पर", "में", "मे",
  "यह", "वह", "ये", "वो", "कोई", "कुछ",
  "और", "भी", "तो", "ना", "न", "जी",
  "एक", "कर", "करो", "करें", "कीजिये", "कीजिए",
  "बताओ", "बताइए", "बताइये", "बता",
  "डालो", "डाल", "डालें", "रखो", "रख",
  "कार्ट", "बैग",
]);

/**
 * Detect if a string contains Devanagari characters.
 */
function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Algorithmic Devanagari-to-Roman transliteration.
 * Works for ANY Hindi word — no hardcoded product dictionary required.
 * Process: word-level overrides first, then character-level conversion.
 */
function transliterateDevanagari(text: string): string {
  if (!containsDevanagari(text)) {
    return text;
  }

  // Split into words, process each independently
  const words = text.split(/\s+/);
  const transliteratedWords: string[] = [];

  for (const word of words) {
    // Skip empty strings
    if (!word) continue;

    // Check if the entire word is a Devanagari filler — skip it
    if (DEVANAGARI_FILLERS.has(word)) {
      continue;
    }

    // Check word-level overrides first
    if (DEVANAGARI_WORD_OVERRIDES[word]) {
      transliteratedWords.push(DEVANAGARI_WORD_OVERRIDES[word]);
      continue;
    }

    // If no Devanagari in this word, keep it as-is
    if (!containsDevanagari(word)) {
      transliteratedWords.push(word);
      continue;
    }

    // Character-level algorithmic transliteration
    let result = "";
    const chars = Array.from(word);
    let i = 0;

    while (i < chars.length) {
      const char = chars[i];
      const nextChar = i + 1 < chars.length ? chars[i + 1] : null;

      // Devanagari digit
      if (DEVANAGARI_DIGITS[char]) {
        result += DEVANAGARI_DIGITS[char];
        i++;
        continue;
      }

      // Standalone vowel
      if (DEVANAGARI_VOWELS[char]) {
        result += DEVANAGARI_VOWELS[char];
        i++;
        continue;
      }

      // Consonant
      if (DEVANAGARI_CONSONANTS[char]) {
        result += DEVANAGARI_CONSONANTS[char];
        i++;

        // Check for halant (virama) — suppresses inherent 'a'
        if (i < chars.length && chars[i] === "\u094D") {
          i++; // skip halant, no inherent 'a'
          continue;
        }

        // Check for matra (vowel diacritic)
        if (i < chars.length && DEVANAGARI_MATRAS[chars[i]] !== undefined) {
          result += DEVANAGARI_MATRAS[chars[i]];
          i++;
          continue;
        }

        // No matra and no halant — add inherent 'a'
        // But suppress trailing 'a' at the end of words (Hindi convention)
        if (i < chars.length) {
          result += "a";
        }
        continue;
      }

      // Matra without consonant (rare but possible)
      if (DEVANAGARI_MATRAS[char] !== undefined) {
        result += DEVANAGARI_MATRAS[char];
        i++;
        continue;
      }

      // Non-Devanagari character — pass through
      result += char;
      i++;
    }

    transliteratedWords.push(result);
  }

  return transliteratedWords.join(" ");
}

// ─────────────────────────────────────────────────────
// Articles and stopwords to strip (multilingual)
// ─────────────────────────────────────────────────────

const STOPWORDS_REGEX = /\b(the|a|an|to|in|for|of|is|it|this|that|me|you|my|our|ke|ka|ki|ko|se|par|pe|mein|hai|kya|ye|wo|ek|aur|mujhe|isko|usko|mera|meri|apna|apni|cart|bag|add|karo|kardo|kar|daal|daalo|daaldo|dikhao|dikhaiye|dikhaye|chahiye)\b/g;

const PRICE_CONSTRAINT_PATTERNS: Array<{
  regex: RegExp;
  apply: (value: number) => Partial<SearchConstraints>;
}> = [
  { regex: /\bunder\s+(\d+)\b/g, apply: (value) => ({ maxPrice: value }) },
  { regex: /\bbelow\s+(\d+)\b/g, apply: (value) => ({ maxPrice: value }) },
  { regex: /\bless than\s+(\d+)\b/g, apply: (value) => ({ maxPrice: value }) },
  { regex: /\bupto\s+(\d+)\b/g, apply: (value) => ({ maxPrice: value }) },
  { regex: /\bup to\s+(\d+)\b/g, apply: (value) => ({ maxPrice: value }) },
  { regex: /\bover\s+(\d+)\b/g, apply: (value) => ({ minPrice: value }) },
  { regex: /\babove\s+(\d+)\b/g, apply: (value) => ({ minPrice: value }) },
  { regex: /\bmore than\s+(\d+)\b/g, apply: (value) => ({ minPrice: value }) },
  { regex: /\b(\d+)\s*ke\s*andar\b/g, apply: (value) => ({ maxPrice: value }) },
  { regex: /\b(\d+)\s*se\s*kam\b/g, apply: (value) => ({ maxPrice: value }) },
  { regex: /\b(\d+)\s*tak\b/g, apply: (value) => ({ maxPrice: value }) },
  { regex: /\b(\d+)\s*ke\s*u[pt]ar\b/g, apply: (value) => ({ minPrice: value }) },
  { regex: /\b(\d+)\s*se\s*zyada\b/g, apply: (value) => ({ minPrice: value }) },
  { regex: /\b(\d+)\s*se\s*upar\b/g, apply: (value) => ({ minPrice: value }) },
];

const DISAMBIGUATION_FACETS: Record<string, Array<{ id: string; label: string; aliases: string[] }>> = {
  serum: [
    { id: "face-serum", label: "Face Serum", aliases: ["face", "skin", "vitamin c"] },
    { id: "hair-serum", label: "Hair Serum", aliases: ["hair"] },
  ],
  kajal: [
    { id: "charcoal-kajal", label: "Charcoal Kajal", aliases: ["charcoal", "black"] },
    { id: "herbal-kajal", label: "Herbal Kajal", aliases: ["herbal", "natural"] },
  ],
  jewellery: [
    { id: "bangles", label: "Bangles", aliases: ["bangle", "bangles"] },
    { id: "necklace", label: "Necklace", aliases: ["necklace", "choker"] },
    { id: "earrings", label: "Earrings", aliases: ["earring", "jhumka", "jhumki"] },
  ],
};

const SEARCH_NOISE_WORDS = new Set([
  "new",
  "arrival",
  "arrivals",
  "featured",
  "signature",
  "standard",
  "latest",
  "gift",
  "gifting",
  "style",
  "pair",
  "set",
  "drop",
  "long",
  "stay",
  "soft",
  "warm",
  "close",
  "made",
  "with",
  "for",
  "and",
  "the",
]);

function normalizeText(value: string): string {
  // Allow Devanagari characters (Unicode range 0900-097F) alongside word characters
  return value.toLowerCase().replace(/[^\w\s\u0900-\u097F]/g, " ").replace(/\s+/g, " ").trim();
}

function singularizeToken(token: string): string {
  if (token.endsWith("ies") && token.length > 3) {
    return `${token.slice(0, -3)}y`;
  }
  if (token.endsWith("s") && !token.endsWith("ss") && token.length > 3) {
    return token.slice(0, -1);
  }
  return token;
}

function normalizeToken(token: string): string {
  return singularizeToken(normalizeText(token));
}

function tokenizeSearchText(value: string): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .map((token) => normalizeToken(token))
    .filter((token) => token.length >= 3 && !SEARCH_NOISE_WORDS.has(token));
}

function buildCatalogKeywordMap(products: Product[]): Map<string, Set<string>> {
  const keywordMap = new Map<string, Set<string>>();

  const addKeywordLinks = (key: string, aliases: Iterable<string>) => {
    const normalizedKey = normalizeToken(key);
    if (!normalizedKey || normalizedKey.length < 3) {
      return;
    }
    if (!keywordMap.has(normalizedKey)) {
      keywordMap.set(normalizedKey, new Set<string>());
    }
    const bucket = keywordMap.get(normalizedKey)!;
    for (const alias of aliases) {
      const normalizedAlias = normalizeToken(alias);
      if (normalizedAlias && normalizedAlias.length >= 3 && normalizedAlias !== normalizedKey) {
        bucket.add(normalizedAlias);
      }
    }
  };

  products.forEach((product) => {
    const searchableTokens = new Set([
      ...tokenizeSearchText(product.name),
      ...tokenizeSearchText(product.tag || ""),
      ...tokenizeSearchText(product.description || ""),
      ...tokenizeSearchText((product.sizes || []).join(" ")),
    ]);

    const categoryTokens = new Set([
      ...tokenizeSearchText(product.product_type || ""),
      ...tokenizeSearchText(product.product_collection || ""),
    ]);

    const primaryTokens = new Set([
      ...tokenizeSearchText(product.name),
      ...tokenizeSearchText(product.tag || ""),
      normalizeToken(product.product_type || ""),
    ]);

    primaryTokens.forEach((token) => addKeywordLinks(token, searchableTokens));
    addKeywordLinks(product.product_type, new Set([...searchableTokens, ...categoryTokens]));
    addKeywordLinks(product.product_collection, new Set([...searchableTokens, ...categoryTokens]));
  });

  return keywordMap;
}

function expandQueryTokens(queryTokens: string[], products: Product[]): string[] {
  const expandedTokens = new Set<string>();
  const catalogKeywordMap = buildCatalogKeywordMap(products);

  queryTokens.forEach((rawToken) => {
    const token = normalizeToken(rawToken);
    if (!token) {
      return;
    }

    expandedTokens.add(token);

    const staticAliases = SYNONYM_MAP[token] || [];
    staticAliases.forEach((alias) => expandedTokens.add(normalizeToken(alias)));

    const catalogAliases = catalogKeywordMap.get(token);
    if (catalogAliases) {
      catalogAliases.forEach((alias) => expandedTokens.add(alias));
    }

    for (const [catalogKey, aliases] of catalogKeywordMap.entries()) {
      if (catalogKey.includes(token) || token.includes(catalogKey)) {
        expandedTokens.add(catalogKey);
        aliases.forEach((alias) => expandedTokens.add(alias));
      }
    }
  });

  return Array.from(expandedTokens).filter(Boolean);
}

function parseNumericConstraintValue(match: string): number | undefined {
  const value = Number(match);
  return Number.isFinite(value) ? value : undefined;
}

function extractSearchConstraints(rawQuery: string): SearchConstraints {
  let normalized = normalizeText(rawQuery);
  const constraints: SearchConstraints = { cleanProductTerm: normalized };

  // Transliterate Devanagari input to Roman script before any processing
  if (containsDevanagari(normalized)) {
    normalized = transliterateDevanagari(normalized);
    // Re-normalize after transliteration (clean up extra spaces etc.)
    normalized = normalized.toLowerCase().replace(/\s+/g, " ").trim();
  }

  for (const filler of FILLER_PHRASES) {
    if (normalized.includes(filler)) {
      normalized = normalized.replace(filler, " ");
    }
  }

  for (const pattern of PRICE_CONSTRAINT_PATTERNS) {
    normalized = normalized.replace(pattern.regex, (_, rawValue: string) => {
      const value = parseNumericConstraintValue(rawValue);
      if (value !== undefined) {
        Object.assign(constraints, pattern.apply(value));
      }
      return " ";
    });
  }

  const cleanProductTerm = normalized
    .replace(STOPWORDS_REGEX, " ")
    .replace(/\b(rs|rupees|rupee|price|keemat|kimat|andar|tak|kam|zyada|upar)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  constraints.cleanProductTerm = cleanProductTerm;
  return constraints;
}

function getProductEffectivePrice(product: Product): number {
  if (typeof product.price === "number") {
    return product.price;
  }
  return 0;
}

function applyPriceConstraints(products: Product[], constraints: SearchConstraints): Product[] {
  return products.filter((product) => {
    const price = getProductEffectivePrice(product);
    if (constraints.minPrice !== undefined && price < constraints.minPrice) {
      return false;
    }
    if (constraints.maxPrice !== undefined && price > constraints.maxPrice) {
      return false;
    }
    return true;
  });
}

function getDisambiguationOptions(queryTerm: string, products: Product[]): DisambiguationOption[] {
  const normalizedTerm = normalizeText(queryTerm);
  const facets = DISAMBIGUATION_FACETS[normalizedTerm];

  if (!facets || facets.length === 0) {
    return [];
  }

  return facets
    .filter((facet) =>
      products.some((product) => {
        const haystack = normalizeText(
          `${product.name} ${product.description || ""} ${product.tag || ""} ${product.product_type || ""}`
        );
        return facet.aliases.some((alias) => haystack.includes(alias));
      })
    )
    .map((facet) => ({
      id: facet.id,
      label: facet.label,
      query: `${facet.label} ${normalizedTerm}`.trim(),
    }));
}

// ─────────────────────────────────────────────────────
// 1. Query Normalizer & Intent Parser
// ─────────────────────────────────────────────────────

export function parseUserIntent(rawQuery: string, _lang?: AssistantLanguage): ParsedIntent {
  let lower = rawQuery.trim().toLowerCase();

  // Transliterate Devanagari input early so confirm/cancel/trigger checks work
  if (containsDevanagari(lower)) {
    lower = transliterateDevanagari(lower).toLowerCase().replace(/\s+/g, " ").trim();
  }

  const constraints = extractSearchConstraints(lower);

  // 1. CONFIRM intent
  if (CONFIRM_WORDS.has(lower) || CONFIRM_PREFIXES.some((p) => lower.startsWith(p))) {
    return { type: "CONFIRM", rawQuery, normalizedQuery: lower, extractedProductTerm: "", constraints };
  }

  // 2. CANCEL intent
  if (CANCEL_WORDS.has(lower) || CANCEL_PREFIXES.some((p) => lower.startsWith(p))) {
    return { type: "CANCEL", rawQuery, normalizedQuery: lower, extractedProductTerm: "", constraints };
  }

  // 3. NEW ARRIVALS intent
  if (NEW_ARRIVAL_TRIGGERS.some((t) => lower.includes(t))) {
    return { type: "NEW_ARRIVALS", rawQuery, normalizedQuery: lower, extractedProductTerm: "", constraints };
  }

  // Extract meaningful product search term by stripping fillers
  let productTerm = lower;
  for (const filler of FILLER_PHRASES) {
    if (productTerm.includes(filler)) {
      productTerm = productTerm.replace(filler, " ");
    }
  }

  // Clean remaining stopwords & punctuation
  productTerm = productTerm
    .replace(STOPWORDS_REGEX, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // 4. ADD TO CART intent
  const isCartEn = ADD_TO_CART_TRIGGERS_EN.some(
    (t) => lower.includes(t.word) && t.requires.some((r) => lower.includes(r))
  );
  const isCartMulti = ADD_TO_CART_TRIGGERS_MULTI.some((t) => lower.includes(t));
  if (isCartEn || isCartMulti) {
    return { type: "ADD_TO_CART", rawQuery, normalizedQuery: lower, extractedProductTerm: constraints.cleanProductTerm || productTerm, constraints };
  }

  // 5. DETAILS / PRICE / RETURNABILITY / STOCK intent
  if (DETAIL_TRIGGERS.some((t) => lower.includes(t))) {
    return { type: "DETAILS", rawQuery, normalizedQuery: lower, extractedProductTerm: constraints.cleanProductTerm || productTerm, constraints };
  }

  // 6. Default SEARCH intent
  return {
    type: "SEARCH",
    rawQuery,
    normalizedQuery: lower,
    extractedProductTerm: constraints.cleanProductTerm || productTerm || lower,
    constraints,
  };
}

// ─────────────────────────────────────────────────────
// Multilingual Confirmation / Cancellation Checkers
// (exported for use by VoiceAssistant.tsx inline checks)
// ─────────────────────────────────────────────────────

export function isConfirmPhrase(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return CONFIRM_WORDS.has(lower) || CONFIRM_PREFIXES.some((p) => lower.startsWith(p));
}

export function isCancelPhrase(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return CANCEL_WORDS.has(lower) || CANCEL_PREFIXES.some((p) => lower.startsWith(p));
}

// ─────────────────────────────────────────────────────
// 2. Token & Synonym Smart Product Matcher
// ─────────────────────────────────────────────────────

export function smartSearchProducts(
  products: Product[],
  queryTerm: string,
  constraints?: SearchConstraints
): Product[] {
  const normalized = normalizeText(queryTerm);
  if (!normalized) {
    return [];
  }

  const queryTokens = normalized
    .split(/\s+/)
    .map((token) => normalizeToken(token))
    .filter((token) => token.length > 0);

  const tokenArray = expandQueryTokens(queryTokens, products);

  // Score each product based on matching tokens
  const scoredProducts = products.map((product) => {
    const pName = normalizeText(product.name);
    const pType = normalizeText(product.product_type || "");
    const pColl = normalizeText(product.product_collection || "");
    const pDesc = normalizeText(product.description || "");
    const pTag = normalizeText(product.tag || "");
    const pSizes = normalizeText((product.sizes || []).join(" "));

    const fullText = `${pName} ${pType} ${pColl} ${pDesc} ${pTag} ${pSizes}`;
    const productTokens = new Set(tokenizeSearchText(fullText));

    let score = 0;

    // Exact string match bonus
    if (pName.includes(normalized)) {
      score += 100;
    }

    // Token match scoring
    queryTokens.forEach((token) => {
      if (pName.includes(token)) {
        score += 30;
      } else if (productTokens.has(token) || fullText.includes(token)) {
        score += 15;
      }
    });

    // Synonym token scoring
    tokenArray.forEach((token) => {
      if (pName.includes(token)) {
        score += 10;
      } else if (productTokens.has(token) || fullText.includes(token)) {
        score += 5;
      }
    });

    return { product, score };
  });

  // Filter out products with 0 score and sort by score descending
  const results = scoredProducts
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

  return constraints ? applyPriceConstraints(results, constraints) : results;
}

// ─────────────────────────────────────────────────────
// Tool Handler (with multilingual response support)
// ─────────────────────────────────────────────────────

export class VoiceToolHandler {
  private getProducts: () => Product[];
  private getNewArrivalsFn: () => Product[];
  private searchProductsFn: (query: string) => Product[];
  private addToCartFn: (productId: string, size: string, quantity?: number) => void;

  constructor(options: {
    getProducts: () => Product[];
    getNewArrivals: () => Product[];
    searchProducts: (query: string) => Product[];
    addToCart: (productId: string, size: string, quantity?: number) => void;
  }) {
    this.getProducts = options.getProducts;
    this.getNewArrivalsFn = options.getNewArrivals;
    this.searchProductsFn = options.searchProducts;
    this.addToCartFn = options.addToCart;
  }

  /**
   * Tool 1: search_products
   */
  public searchProducts(query: string, contextProduct?: Product, lang: AssistantLanguage = "en"): ToolResult {
    const parsed = parseUserIntent(query, lang);
    const searchTerm = parsed.constraints.cleanProductTerm || parsed.extractedProductTerm || query;
    const hasPriceConstraint =
      parsed.constraints.minPrice !== undefined || parsed.constraints.maxPrice !== undefined;

    const allProducts = this.getProducts();
    const broadMatches = smartSearchProducts(allProducts, searchTerm);
    let matches = hasPriceConstraint
      ? applyPriceConstraints(broadMatches, parsed.constraints)
      : broadMatches;

    // Fallback to default search if smart search produces no results
    if (matches.length === 0 && searchTerm) {
      const fallbackMatches = this.searchProductsFn(searchTerm);
      matches = hasPriceConstraint
        ? applyPriceConstraints(fallbackMatches, parsed.constraints)
        : fallbackMatches;
    }

    const disambiguationOptions = getDisambiguationOptions(searchTerm, broadMatches);
    if (matches.length > 1 && disambiguationOptions.length > 1) {
      const optionText = disambiguationOptions
        .map((option, index) => `${index + 1}) ${option.label}`)
        .join(", ");

      return {
        success: true,
        message:
          getLocalizedResponse("disambiguate_options", lang, {
            term: searchTerm,
            options: optionText,
          }) ||
          `I found multiple types for ${searchTerm}: ${optionText}. Which one do you want?`,
        disambiguationOptions,
        constraints: parsed.constraints,
        data: matches,
      };
    }

    if (matches.length === 0 && broadMatches.length > 0 && hasPriceConstraint) {
      return {
        success: true,
        message:
          getLocalizedResponse("search_filtered_none", lang, { term: searchTerm }) ||
          `I found products for ${searchTerm}, but none matched your price range.`,
        data: [],
        constraints: parsed.constraints,
      };
    }

    if (matches.length === 0) {
      // Build dynamic suggestion that EXCLUDES the term the user just searched for
      const suggestionPool = ["kajal", "serum", "bangles", "shower gel", "mist"];
      const searchedLower = (searchTerm || "").toLowerCase();
      const filteredSuggestions = suggestionPool.filter(
        (s) => !searchedLower.includes(s) && !s.includes(searchedLower)
      );
      const suggestionText = filteredSuggestions.slice(0, 3).join(", ");

      // Build a smarter fallback message that doesn't repeat the searched term
      const fallbackHint = suggestionText
        ? (lang === "hi"
            ? `${suggestionText} के बारे में पूछें!`
            : lang === "hinglish"
              ? `${suggestionText} ke baare mein poocho!`
              : `Try asking for ${suggestionText}!`)
        : (lang === "hi"
            ? "कोई और प्रोडक्ट खोजें!"
            : lang === "hinglish"
              ? "Koi aur product search karo!"
              : "Try searching for another product!");

      const noneTemplate = getLocalizedResponse("search_none", lang, { term: searchTerm || query });
      // Replace the static suggestion part with our dynamic one
      const staticSuggestionPatterns = [
        /Try asking for kajal, serum, or bangles[.!]?/i,
        /काजल, सीरम, या बैंगल्स के बारे में पूछें[.!]?/,
        /Kajal, serum, ya bangles ke baare mein poocho[.!]?/i,
      ];
      let smartMessage = noneTemplate;
      for (const pattern of staticSuggestionPatterns) {
        smartMessage = smartMessage.replace(pattern, fallbackHint);
      }

      return {
        success: true,
        message: smartMessage,
        data: [],
        constraints: parsed.constraints,
      };
    }

    // 1 match found
    if (matches.length === 1) {
      const p = matches[0];
      const discountText = p.discount_percent ? ` (${p.discount_percent}% OFF)` : "";
      const priceText = `₹${p.price}${discountText}`;
      const stockText = p.sizes.some((s) => (p.variantStock?.[s] ?? 0) > 0)
        ? (lang === "hi" ? "स्टॉक में" : "In Stock")
        : (lang === "hi" ? "स्टॉक में नहीं" : "Out of Stock");

      return {
        success: true,
        message: hasPriceConstraint
          ? getLocalizedResponse("search_filtered_single", lang, {
              term: searchTerm,
              name: p.name,
              price: priceText,
              stock: stockText,
            }) || `I found 1 product for ${searchTerm} within your price range: ${p.name} for ${priceText} [${stockText}].`
          : getLocalizedResponse("search_single", lang, { name: p.name, price: priceText, stock: stockText }),
        matchedProduct: p,
        candidateProducts: [p],
        constraints: parsed.constraints,
        data: [p],
      };
    }

    // Multiple matches found
    const candidates = matches.slice(0, 3);
    const listText = candidates
      .map((p, index) => `${index + 1}) ${p.name} (₹${p.price})`)
      .join(", ");

    return {
      success: true,
      message: hasPriceConstraint
        ? getLocalizedResponse("search_filtered_multiple", lang, {
            term: searchTerm,
            count: matches.length,
            list: listText,
          }) || `I found ${matches.length} matching products for ${searchTerm} within your price range: ${listText}.`
        : getLocalizedResponse("search_multiple", lang, { count: matches.length, list: listText }),
      candidateProducts: candidates,
      constraints: parsed.constraints,
      data: candidates,
    };
  }

  /**
   * Tool 2: get_product_details
   */
  public getProductDetails(query: string, contextProduct?: Product, lang: AssistantLanguage = "en"): ToolResult {
    const parsed = parseUserIntent(query, lang);
    const searchTerm = parsed.constraints.cleanProductTerm || parsed.extractedProductTerm;

    const allProducts = this.getProducts();
    let product: Product | undefined;

    if (searchTerm) {
      const matches = smartSearchProducts(allProducts, searchTerm, parsed.constraints);
      product = matches[0];
    }

    // Fallback to conversation context memory
    if (!product && contextProduct) {
      product = contextProduct;
    }

    if (!product) {
      return {
        success: false,
        message: getLocalizedResponse("detail_not_found", lang, { term: searchTerm || query }),
      };
    }

    const stockSummary = product.sizes
      .map((s) => {
        const stock = product!.variantStock?.[s] ?? 0;
        const price = product!.variantPrices?.[s] ?? product!.price;
        return `${s}: ${stock > 0 ? `${stock} in stock` : "Out of stock"} (₹${price})`;
      })
      .join("; ");

    const totalStock = product.sizes.reduce(
      (acc, s) => acc + (product!.variantStock?.[s] ?? 0),
      0
    );

    const mrpText = product.mrpPrice ? `, MRP ₹${product.mrpPrice}` : "";
    const discountText = product.discount_percent ? `, ${product.discount_percent}% OFF` : "";
    const returnText = product.is_returnable
      ? (lang === "hi" ? "वापसी योग्य" : lang === "hinglish" ? "Return ho sakta hai" : "Eligible for return")
      : (lang === "hi" ? "वापसी नहीं" : lang === "hinglish" ? "Return nahi hoga" : "Non-returnable");
    const returnPolicy = returnText + (product.return_policy_note ? ` (${product.return_policy_note})` : "");

    return {
      success: true,
      message: getLocalizedResponse("detail", lang, {
        name: product.name,
        price: product.price,
        mrp: mrpText,
        discount: discountText,
        stockSummary,
        returnPolicy,
      }),
      matchedProduct: product,
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        mrpPrice: product.mrpPrice,
        discount_percent: product.discount_percent,
        inStock: totalStock > 0,
        totalStock,
        is_returnable: product.is_returnable,
        return_policy_note: product.return_policy_note,
      },
    };
  }

  /**
   * Tool 3: get_new_arrivals
   */
  public getNewArrivals(lang: AssistantLanguage = "en"): ToolResult {
    const arrivals = this.getNewArrivalsFn();
    if (arrivals.length === 0) {
      return {
        success: true,
        message: getLocalizedResponse("new_arrivals_none", lang),
        data: [],
      };
    }

    const candidates = arrivals.slice(0, 3);
    const listText = candidates
      .map((s) => `${s.name} (₹${s.price}${s.discount_percent ? `, ${s.discount_percent}% OFF` : ""})`)
      .join(", ");

    return {
      success: true,
      message: getLocalizedResponse("new_arrivals", lang, { list: listText }),
      candidateProducts: candidates,
      data: candidates,
    };
  }

  /**
   * Tool 4: add_to_cart (With Context Memory & Explicit Confirmation Enforcement)
   */
  public addToCart(
    query: string,
    contextProduct?: Product,
    candidateList?: Product[],
    size?: string,
    quantity: number = 1,
    confirmed: boolean = false,
    lang: AssistantLanguage = "en"
  ): ToolResult {
    const parsed = parseUserIntent(query, lang);
    const searchTerm = parsed.constraints.cleanProductTerm || parsed.extractedProductTerm;

    const allProducts = this.getProducts();
    let product: Product | undefined;

    if (searchTerm) {
      const matches = smartSearchProducts(allProducts, searchTerm, parsed.constraints);
      if (matches.length === 1) {
        product = matches[0];
      } else if (matches.length > 1) {
        const listText = matches
          .slice(0, 3)
          .map((p, index) => `${index + 1}) ${p.name} (₹${p.price})`)
          .join(", ");
        return {
          success: true,
          message: getLocalizedResponse("cart_multiple", lang, { count: matches.length, list: listText }),
          candidateProducts: matches.slice(0, 3),
        };
      }
    }

    // Use memory context if product not explicitly named in query
    if (!product && contextProduct) {
      product = contextProduct;
    } else if (!product && candidateList && candidateList.length === 1) {
      product = candidateList[0];
    } else if (!product && candidateList && candidateList.length > 1) {
      const listText = candidateList
        .map((p, index) => `${index + 1}) ${p.name} (₹${p.price})`)
        .join(", ");
      return {
        success: true,
        message: getLocalizedResponse("cart_earlier", lang, { list: listText }),
        candidateProducts: candidateList,
      };
    }

    if (!product) {
      return {
        success: false,
        message: getLocalizedResponse("cart_which_product", lang),
      };
    }

    // Select variant size
    const selectedSize = size && product.sizes.includes(size) ? size : product.sizes[0] || "Standard";
    const availableStock = product.variantStock?.[selectedSize] ?? 0;

    if (availableStock <= 0) {
      return {
        success: false,
        message: getLocalizedResponse("cart_out_of_stock", lang, { name: product.name, size: selectedSize }),
        matchedProduct: product,
      };
    }

    // SAFETY CHECK: If confirmation has NOT been given, ask for explicit confirmation first!
    if (!confirmed) {
      return {
        success: true,
        requiresConfirmation: true,
        message: getLocalizedResponse("cart_confirm", lang, { name: product.name, size: selectedSize, price: product.price }),
        matchedProduct: product,
        pendingCartItem: {
          product,
          size: selectedSize,
          quantity: Math.min(quantity, availableStock),
        },
      };
    }

    // Explicit confirmation confirmed = true: Execute cart mutation
    const finalQty = Math.min(quantity, availableStock);
    this.addToCartFn(product.id, selectedSize, finalQty);

    return {
      success: true,
      requiresConfirmation: false,
      message: getLocalizedResponse("cart_added", lang, { name: product.name, size: selectedSize, qty: finalQty }),
      matchedProduct: product,
      data: { productId: product.id, size: selectedSize, quantity: finalQty },
    };
  }
}

// ─────────────────────────────────────────────────────
// Fetch Realtime Session Token
// ─────────────────────────────────────────────────────

/**
 * Fetch realtime session key from Netlify function endpoint.
 * Uses the GA /v1/realtime/client_secrets endpoint (migrated from deprecated /v1/realtime/sessions beta).
 */
export async function fetchRealtimeSessionToken(): Promise<{
  status: "success" | "fallback" | "error";
  client_secret?: string;
  model?: string;
  message?: string;
}> {
  try {
    const res = await fetch("/.netlify/functions/realtime-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn("[VoiceAssistant] Realtime session function returned HTTP", res.status);
      return { status: "fallback", message: `Function returned HTTP status ${res.status}` };
    }

    const data = await res.json();

    if (data.status === "success") {
      console.info("[VoiceAssistant] Realtime session active — model:", data.model, "| expires:", data.expires_at);
    } else {
      console.warn("[VoiceAssistant] Realtime session fallback:", data.message);
    }

    return data;
  } catch (error: any) {
    console.warn("[VoiceAssistant] Realtime session fetch error:", error?.message);
    return { status: "fallback", message: error?.message || "Failed to reach realtime session endpoint" };
  }
}
