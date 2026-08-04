import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, X, Sparkles, ShoppingBag, Check, AlertCircle, RefreshCw } from "lucide-react";
import { useStore } from "../context/StoreContext";
import {
  VoiceToolHandler,
  fetchRealtimeSessionToken,
  parseUserIntent,
  isConfirmPhrase,
  isCancelPhrase,
  getLocalizedResponse,
  type ToolResult,
  type AssistantLanguage,
} from "../services/voiceAssistantService";
import type { Product } from "../types";

type Message = {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: Date;
  pendingConfirmation?: {
    productName: string;
    size: string;
    quantity: number;
  };
};

type AssistantState = "idle" | "listening" | "thinking" | "speaking" | "confirmation_pending" | "error";

// ─────────────────────────────────────────────────────
// Speech recognition / synthesis language mapping
// ─────────────────────────────────────────────────────

const SPEECH_LANG_MAP: Record<AssistantLanguage, string> = {
  en: "en-IN",
  hi: "hi-IN",
  hinglish: "hi-IN",
};

// ─────────────────────────────────────────────────────
// Language selector labels
// ─────────────────────────────────────────────────────

const LANG_OPTIONS: { key: AssistantLanguage; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "hi", label: "हिं" },
  { key: "hinglish", label: "Hi-En" },
];

export default function VoiceAssistant() {
  const { products, getNewArrivals, searchProducts, addToCart } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<AssistantState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState<AssistantLanguage>("en");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: getLocalizedResponse("welcome", "en"),
      timestamp: new Date(),
    },
  ]);

  // Context memory state across conversational turns
  const [lastMatchedProduct, setLastMatchedProduct] = useState<Product | undefined>(undefined);
  const [candidateProducts, setCandidateProducts] = useState<Product[] | undefined>(undefined);
  const [pendingCartItem, setPendingCartItem] = useState<{
    product: Product;
    productName: string;
    size: string;
    quantity: number;
  } | null>(null);
  const [realtimeMode, setRealtimeMode] = useState<"checking" | "active" | "fallback">("checking");

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Tool Handler with store functions
  const toolHandlerRef = useRef<VoiceToolHandler | null>(null);

  useEffect(() => {
    toolHandlerRef.current = new VoiceToolHandler({
      getProducts: () => products,
      getNewArrivals,
      searchProducts,
      addToCart,
    });
  }, [products, getNewArrivals, searchProducts, addToCart]);

  // Auto scroll transcript window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, state]);

  // Handle language change — update welcome message
  const handleLanguageChange = useCallback((newLang: AssistantLanguage) => {
    setLanguage(newLang);
    // Add system notification about language change
    const langNames: Record<AssistantLanguage, string> = {
      en: "English",
      hi: "हिंदी",
      hinglish: "Hinglish",
    };
    setMessages((prev) => [
      ...prev,
      {
        id: `lang-${Date.now()}`,
        sender: "system",
        text: `Language switched to ${langNames[newLang]}`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Speech synthesis speaker
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = SPEECH_LANG_MAP[language];

      utterance.onstart = () => setState("speaking");
      utterance.onend = () => {
        setState("idle");
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        setState("idle");
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setState("idle");
      if (onEnd) onEnd();
    }
  }, [language]);

  // Add message to chat log
  const addMessage = useCallback((sender: "user" | "assistant" | "system", text: string, pendingItem?: any) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender,
        text,
        timestamp: new Date(),
        pendingConfirmation: pendingItem,
      },
    ]);
  }, []);

  // Process User Input query against tools & intent classifier
  const processQuery = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;

      addMessage("user", userText);
      setState("thinking");

      const intent = parseUserIntent(userText, language);

      // 1. CONFIRM INTENT (when pending cart confirmation exists)
      if (intent.type === "CONFIRM" || (pendingCartItem && isConfirmPhrase(userText))) {
        if (pendingCartItem) {
          const result = toolHandlerRef.current?.addToCart(
            pendingCartItem.product.name,
            pendingCartItem.product,
            undefined,
            pendingCartItem.size,
            pendingCartItem.quantity,
            true, // Explicitly confirmed!
            language
          );

          setPendingCartItem(null);
          if (result?.success) {
            addMessage("assistant", result.message);
            speak(result.message);
          } else {
            const failMsg = result?.message || "Could not add item to cart.";
            addMessage("assistant", failMsg);
            speak(failMsg);
          }
          return;
        } else {
          // Confirm phrase but no pending item — give clarification
          const msg = getLocalizedResponse("confirm_no_pending", language);
          addMessage("assistant", msg);
          speak(msg);
          setState("idle");
          return;
        }
      }

      // 2. CANCEL INTENT
      if (intent.type === "CANCEL" || (pendingCartItem && isCancelPhrase(userText))) {
        if (pendingCartItem) {
          setPendingCartItem(null);
          const cancelMsg = getLocalizedResponse("cancel", language);
          addMessage("assistant", cancelMsg);
          speak(cancelMsg);
        } else {
          const msg = getLocalizedResponse("cancel_no_pending", language);
          addMessage("assistant", msg);
          speak(msg);
          setState("idle");
        }
        return;
      }

      // Check candidate selection by index (e.g. "first one", "1", "2", "mamaearth")
      const lower = userText.toLowerCase();
      if (candidateProducts && candidateProducts.length > 1) {
        let chosenProduct: Product | undefined;
        if (lower.includes("first") || lower.includes("1") || lower.includes("one") || lower.includes("pehla") || lower.includes("pahla")) {
          chosenProduct = candidateProducts[0];
        } else if (lower.includes("second") || lower.includes("2") || lower.includes("two") || lower.includes("doosra") || lower.includes("dusra")) {
          chosenProduct = candidateProducts[1];
        } else if (lower.includes("third") || lower.includes("3") || lower.includes("three") || lower.includes("teesra") || lower.includes("tisra")) {
          chosenProduct = candidateProducts[2];
        } else {
          chosenProduct = candidateProducts.find((p) => p.name.toLowerCase().includes(intent.extractedProductTerm));
        }

        if (chosenProduct) {
          setLastMatchedProduct(chosenProduct);
          setCandidateProducts(undefined);

          if (intent.type === "ADD_TO_CART") {
            const result = toolHandlerRef.current?.addToCart(chosenProduct.name, chosenProduct, undefined, undefined, 1, false, language);
            if (result?.requiresConfirmation && result.pendingCartItem) {
              const pending = {
                product: result.pendingCartItem.product,
                productName: result.pendingCartItem.product.name,
                size: result.pendingCartItem.size,
                quantity: result.pendingCartItem.quantity,
              };
              setPendingCartItem(pending);
              setState("confirmation_pending");
              addMessage("assistant", result.message, pending);
              speak(result.message);
              return;
            }
          }

          const detailResult = toolHandlerRef.current?.getProductDetails(chosenProduct.name, chosenProduct, language);
          const msg = detailResult?.message || `Selected ${chosenProduct.name}. Would you like to add it to your cart?`;
          addMessage("assistant", msg);
          speak(msg);
          return;
        }
      }

      // 3. ADD TO CART INTENT
      if (intent.type === "ADD_TO_CART") {
        const result = toolHandlerRef.current?.addToCart(
          userText,
          lastMatchedProduct,
          candidateProducts,
          undefined,
          1,
          false,
          language
        );

        if (result?.matchedProduct) {
          setLastMatchedProduct(result.matchedProduct);
        }
        if (result?.candidateProducts) {
          setCandidateProducts(result.candidateProducts);
        }

        if (result?.requiresConfirmation && result.pendingCartItem) {
          const pending = {
            product: result.pendingCartItem.product,
            productName: result.pendingCartItem.product.name,
            size: result.pendingCartItem.size,
            quantity: result.pendingCartItem.quantity,
          };
          setPendingCartItem(pending);
          setState("confirmation_pending");
          addMessage("assistant", result.message, pending);
          speak(result.message);
        } else {
          const msg = result?.message || getLocalizedResponse("cart_which_product", language);
          addMessage("assistant", msg);
          speak(msg);
        }
        return;
      }

      // 4. NEW ARRIVALS INTENT
      if (intent.type === "NEW_ARRIVALS") {
        const result = toolHandlerRef.current?.getNewArrivals(language);
        if (result?.candidateProducts && result.candidateProducts.length > 0) {
          setCandidateProducts(result.candidateProducts);
          setLastMatchedProduct(result.candidateProducts[0]);
        }
        const msg = result?.message || getLocalizedResponse("new_arrivals_none", language);
        addMessage("assistant", msg);
        speak(msg);
        return;
      }

      // 5. DETAILS INTENT
      if (intent.type === "DETAILS") {
        const result = toolHandlerRef.current?.getProductDetails(userText, lastMatchedProduct, language);
        if (result?.matchedProduct) {
          setLastMatchedProduct(result.matchedProduct);
        }
        const msg = result?.message || getLocalizedResponse("detail_not_found", language, { term: userText });
        addMessage("assistant", msg);
        speak(msg);
        return;
      }

      // 6. DEFAULT SEARCH INTENT
      const searchResult = toolHandlerRef.current?.searchProducts(userText, lastMatchedProduct, language);

      if (searchResult?.disambiguationOptions) {
        setLastMatchedProduct(undefined);
        setCandidateProducts(undefined);
      } else if (searchResult?.matchedProduct) {
        setLastMatchedProduct(searchResult.matchedProduct);
        setCandidateProducts(undefined);
      } else if (searchResult?.candidateProducts) {
        setCandidateProducts(searchResult.candidateProducts);
        if (searchResult.candidateProducts.length > 0) {
          setLastMatchedProduct(searchResult.candidateProducts[0]);
        }
      } else {
        setCandidateProducts(undefined);
      }

      const respMsg = searchResult?.message || getLocalizedResponse("search_none", language, { term: userText });
      addMessage("assistant", respMsg);
      speak(respMsg);
    },
    [addMessage, candidateProducts, language, lastMatchedProduct, pendingCartItem, speak]
  );

  // Start voice recognition
  const startListening = useCallback(() => {
    setErrorMessage(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Voice recognition is not supported in this browser. You can type commands below.");
      setState("error");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = SPEECH_LANG_MAP[language];

      recognition.onstart = () => {
        setState("listening");
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setErrorMessage("Microphone access was denied. Please allow microphone permissions in your browser.");
        } else if (event.error !== "no-speech") {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setState("idle");
      };

      recognition.onend = () => {
        setTranscript((finalTranscript) => {
          if (finalTranscript && finalTranscript.trim()) {
            processQuery(finalTranscript.trim());
          } else {
            setState("idle");
          }
          return "";
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setErrorMessage("Could not access microphone.");
      setState("error");
    }
  }, [language, processQuery]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState("idle");
  }, []);

  // Handle direct Confirmation click
  const handleConfirmAdd = (pending: { productName: string; size: string; quantity: number }) => {
    const result = toolHandlerRef.current?.addToCart(pending.productName, lastMatchedProduct, undefined, pending.size, pending.quantity, true, language);
    setPendingCartItem(null);
    if (result?.success) {
      addMessage("assistant", result.message);
      speak(result.message);
    }
  };

  const handleCancelAdd = () => {
    setPendingCartItem(null);
    const msg = getLocalizedResponse("cancel", language);
    addMessage("assistant", msg);
    speak(msg);
  };

  // Toggle Panel Open/Close
  const togglePanel = () => {
    if (!isOpen) {
      setIsOpen(true);
      setRealtimeMode("checking");
      // Check backend realtime session availability
      fetchRealtimeSessionToken().then((result) => {
        setRealtimeMode(result.status === "success" ? "active" : "fallback");
      });
    } else {
      stopListening();
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {!isOpen && (
          <button
            type="button"
            onClick={togglePanel}
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#003D3B] text-[#B76E79] shadow-xl shadow-black/25 ring-2 ring-[#B76E79]/40 transition-all duration-300 hover:scale-105 hover:bg-[#003D3B]/90 focus:outline-none"
            aria-label="Open Uphar Voice Assistant"
          >
            <span className="relative flex items-center justify-center">
              <Mic className="h-6 w-6 text-[#B76E79] transition-transform duration-300 group-hover:scale-110" />
              <Sparkles className="absolute -right-2 -top-2 h-3.5 w-3.5 text-[#B76E79] animate-pulse" />
            </span>
          </button>
        )}
      </div>

      {/* Expanded Voice Panel Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[90vw] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[#B76E79]/30 bg-[#003D3B] text-white shadow-2xl backdrop-blur-lg transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#B76E79]/20 bg-[#003D3B]/90 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B76E79]/20 text-[#B76E79]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">Uphar Voice Assistant</h3>
                <span className="text-[11px] text-[#B76E79]">
                  {realtimeMode === "checking" ? "Connecting…" : realtimeMode === "active" ? "✦ Realtime AI Active" : "Browser Speech Mode"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={togglePanel}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close Assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-center gap-1 border-b border-white/10 bg-[#003D3B]/70 px-3 py-2">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleLanguageChange(opt.key)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  language === opt.key
                    ? "bg-[#B76E79] text-white shadow-md shadow-[#B76E79]/30"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90"
                }`}
                aria-label={`Switch to ${opt.label}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div className="flex items-center gap-2 bg-red-900/80 px-3 py-2 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-300 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Transcript / Messages Window */}
          <div className="flex max-h-[300px] min-h-[180px] flex-col gap-3 overflow-y-auto p-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#B76E79] text-white rounded-br-none"
                      : msg.sender === "system"
                      ? "bg-white/10 text-white/80 italic text-center w-full"
                      : "bg-white/10 text-white border border-white/10 rounded-bl-none"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Interactive Confirmation Action Buttons */}
                  {msg.pendingConfirmation && (
                    <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5">
                      <button
                        type="button"
                        onClick={() => handleConfirmAdd(msg.pendingConfirmation!)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#B76E79] px-3 py-1.5 font-semibold text-white transition hover:bg-[#B76E79]/80"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {getLocalizedResponse("confirm_button", language)}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAdd}
                        className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        {getLocalizedResponse("cancel_button", language)}
                      </button>
                    </div>
                  )}
                </div>
                <span className="mt-1 text-[10px] text-white/40 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            {/* Live speech transcription stream */}
            {transcript && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl rounded-br-none bg-[#B76E79]/60 px-3.5 py-2 text-white italic animate-pulse">
                  "{transcript}..."
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Status Indicator Bar */}
          <div className="flex items-center justify-between border-t border-white/10 bg-[#003D3B]/60 px-4 py-2.5 text-xs text-white/70">
            <div className="flex items-center gap-2">
              {state === "listening" && (
                <span className="flex items-center gap-1.5 text-[#B76E79] font-medium">
                  <span className="h-2 w-2 rounded-full bg-[#B76E79] animate-ping" />
                  {language === "hi" ? "सुन रहा हूँ..." : language === "hinglish" ? "Sun raha hoon..." : "Listening..."}
                </span>
              )}
              {state === "thinking" && (
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  {language === "hi" ? "खोज रहा हूँ..." : language === "hinglish" ? "Search kar raha hoon..." : "Searching products..."}
                </span>
              )}
              {state === "speaking" && (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                  {language === "hi" ? "बोल रहा हूँ..." : language === "hinglish" ? "Bol raha hoon..." : "Speaking response..."}
                </span>
              )}
              {state === "confirmation_pending" && (
                <span className="flex items-center gap-1.5 text-amber-200 font-medium">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {language === "hi" ? "पुष्टि का इंतज़ार..." : language === "hinglish" ? "Confirmation ka wait..." : "Awaiting confirmation..."}
                </span>
              )}
              {state === "idle" && (
                <span className="text-white/50">
                  {language === "hi" ? "माइक दबाकर बोलें" : language === "hinglish" ? "Mic dabao aur bolo" : "Tap mic to speak"}
                </span>
              )}
              {state === "error" && (
                <span className="text-red-300">
                  {language === "hi" ? "फिर से कोशिश करें" : language === "hinglish" ? "Dubara try karo" : "Tap mic to try again"}
                </span>
              )}
            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between gap-3 bg-[#003D3B] p-3 border-t border-white/10">
            <button
              type="button"
              onClick={state === "listening" ? stopListening : startListening}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 font-medium transition-all duration-300 ${
                state === "listening"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                  : "bg-[#B76E79] text-white hover:bg-[#B76E79]/90 shadow-md"
              }`}
            >
              {state === "listening" ? (
                <>
                  <MicOff className="h-4 w-4" />
                  {language === "hi" ? "सुनना बंद करें" : language === "hinglish" ? "Sunna band karo" : "Stop Listening"}
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  {state === "speaking"
                    ? (language === "hi" ? "रोकें और बोलें" : language === "hinglish" ? "Roko aur bolo" : "Interrupt & Speak")
                    : (language === "hi" ? "बोलने के लिए दबाएँ" : language === "hinglish" ? "Bolne ke liye dabao" : "Tap to Speak")
                  }
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
