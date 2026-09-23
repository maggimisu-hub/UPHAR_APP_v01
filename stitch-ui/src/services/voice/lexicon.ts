/**
 * Lexicon and Vocabulary Dictionary for Uphar Voice Assistant
 * 
 * Maps colloquial Hindi/Hinglish and English retail phrases to canonical domain values.
 */

export interface BrandEntry {
  canonical: string;
  aliases: string[];
}

export interface CategoryEntry {
  canonical: string;
  aliases: string[];
  productType?: "jewellery" | "bangles" | "cosmetics";
}

export const CANONICAL_BRANDS: BrandEntry[] = [
  { canonical: "VLCC", aliases: ["vlcc", "v l c c", "velcc", "वीएलसीसी"] },
  { canonical: "Mamaearth", aliases: ["mamaearth", "mama earth", "mamearth", "मामाअर्थ"] },
  { canonical: "The Derma Co", aliases: ["the derma co", "derma co", "derma company", "dermaco"] },
  { canonical: "Dot & Key", aliases: ["dot & key", "dot and key", "dot key", "dotkey"] },
  { canonical: "Fiama", aliases: ["fiama", "fiama di wills", "fiyama", "फियामा"] },
  { canonical: "Lakme", aliases: ["lakme", "lakmey", "lakme india", "लक्मे"] },
  { canonical: "Plum", aliases: ["plum", "plum goodness"] },
  { canonical: "Swiss Beauty", aliases: ["swiss beauty", "swissbeauty"] },
  { canonical: "Sugar", aliases: ["sugar", "sugar cosmetics"] },
  { canonical: "Biotique", aliases: ["biotique"] },
];

export const CANONICAL_CATEGORIES: CategoryEntry[] = [
  {
    canonical: "Kajal",
    aliases: ["kajal", "kaajal", "kohl", "surma", "eye liner", "eyeliner", "काजल"],
    productType: "cosmetics",
  },
  {
    canonical: "Serum",
    aliases: ["serum", "siram", "face serum", "सीरम"],
    productType: "cosmetics",
  },
  {
    canonical: "Bangles",
    aliases: ["bangles", "bangle", "choodi", "churi", "chuda", "kangan", "कंगन", "चूड़ी"],
    productType: "bangles",
  },
  {
    canonical: "Jhumka",
    aliases: ["jhumka", "jhumki", "earring", "earrings", "jhumke", "झुमका"],
    productType: "jewellery",
  },
  {
    canonical: "Necklace",
    aliases: ["necklace", "haar", "choker", "set", "jewellery set"],
    productType: "jewellery",
  },
  {
    canonical: "Shower Gel",
    aliases: ["shower gel", "body wash", "bath gel", "bodywash"],
    productType: "cosmetics",
  },
  {
    canonical: "Sunscreen",
    aliases: ["sunscreen", "sun screen", "sunblock"],
    productType: "cosmetics",
  },
  {
    canonical: "Face Wash",
    aliases: ["face wash", "facewash"],
    productType: "cosmetics",
  },
];

export const ORDINAL_MAPPINGS: Array<{ index: number; phrases: string[] }> = [
  { index: 0, phrases: ["first", "1st", "pehla", "pehli", "first one", "पहला", "पहली"] },
  { index: 1, phrases: ["second", "2nd", "doosra", "dusra", "doosri", "dusri", "second one", "दूसरा", "दूसरी"] },
  { index: 2, phrases: ["third", "3rd", "teesra", "tisra", "teesri", "tisri", "third one", "तीसरा", "तीसरी"] },
  { index: 3, phrases: ["fourth", "4th", "chautha", "chauthi", "fourth one", "चौथा", "चौथी"] },
];

export const RELATIVE_MODIFIERS = ["wala", "wali", "wale", "waley", "one"];

export const DIRECT_PRONOUNS = [
  "it",
  "this",
  "isko",
  "iska",
  "iske",
  "ye",
  "yeh",
  "isse",
  "this one",
  "it's",
  "its",
  "इसको",
  "इसका",
  "इसके",
  "यह",
  "ये",
];

export const OPEN_VERBS = [
  "open",
  "kholo",
  "khol do",
  "khol",
  "kholna",
  "kholiye",
  "open karo",
  "open kar do",
  "page kholo",
  "खोलो",
  "खोल दो",
];

export const DISPLAY_VERBS = [
  "dikhao",
  "dikhaye",
  "dikhana",
  "dikhlao",
  "show",
  "show me",
  "display",
  "dekho",
  "दिखाओ",
  "दिखाइए",
];

export const PRICE_TRIGGERS = [
  "price",
  "kitne ka hai",
  "kitna hai",
  "kitne ki hai",
  "daam",
  "rate",
  "cost",
  "how much",
  "price kya hai",
  "kitne rupaye",
  "रुपये",
  "दाम",
  "कितने का",
];

export const AVAILABILITY_TRIGGERS = [
  "available",
  "in stock",
  "stock",
  "hai kya",
  "milega",
  "milega kya",
  "hai ya nahi",
  "bacha hai",
  "स्टॉक",
  "है क्या",
  "मिलेगा",
];

export const DETAILS_TRIGGERS = [
  "details",
  "detail",
  "baare mein",
  "bare me",
  "iske baare",
  "kya hai",
  "isme kya hai",
  "tell me about",
  "tell me more about",
  "tell me more",
  "describe",
  "description",
  "डिटेल्स",
  "बारे में",
];

export const CART_TRIGGERS = [
  // Multi-word specific action phrases in English
  "add to cart",
  "add this to cart",
  "add it to cart",
  "add to bag",
  "add this to bag",
  "add it to bag",
  "put in cart",
  "put this in cart",
  "put it in cart",
  "put in bag",
  "put this in bag",
  "buy now",
  "buy this",
  // Hindi / Hinglish action phrases
  "cart mein daal",
  "cart me daal",
  "cart mein daalo",
  "cart me daalo",
  "cart mein daal do",
  "cart me daal do",
  "cart mein",
  "cart me",
  "cart karo",
  "cart mein add",
  "cart me add",
  "bag mein daal",
  "bag me daal",
  "bag mein",
  "bag me",
  "kharidna hai",
  "kharidna",
  "कार्ट में डाल",
  "कार्ट में जोड़ो",
  "कार्ट में जोड़ो",
  "कार्ट में",
];

export const CONFIRM_TRIGGERS = [
  "yes",
  "haan",
  "ha",
  "yep",
  "sure",
  "confirm",
  "kar do",
  "daal do",
  "ok",
  "okay",
  "theek hai",
  "proceed",
  "हाँ",
  "हां",
  "ठीक है",
];

export const CANCEL_TRIGGERS = [
  "no",
  "nahi",
  "nahin",
  "cancel",
  "cancel karo",
  "mat karo",
  "don't add",
  "dont add",
  "stop",
  "rehne do",
  "रद्द",
  "नहीं",
  "रहने दो",
];

export const PAGINATION_TRIGGERS = [
  "show me more",
  "show more",
  "more products",
  "aur dikhao",
  "aur products dikhao",
  "aur products",
  "aur options dikhao",
  "aage dikhao",
  "next page",
  "next products",
  "next",
  "और दिखाओ",
  "और प्रोडक्ट्स दिखाओ",
  "आगे दिखाओ",
];

export const NEW_ARRIVALS_TRIGGERS = [
  "new arrivals",
  "new arrival",
  "what's new",
  "whats new",
  "what s new",
  "what is new",
  "new products",
  "latest products",
  "latest arrivals",
  "latest",
  "naye products",
  "naya product",
  "naya",
  "naye",
  "nayi",
  "नए प्रोडक्ट्स",
  "नया",
  "नए",
];
