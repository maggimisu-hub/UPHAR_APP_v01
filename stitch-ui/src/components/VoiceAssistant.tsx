import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, MicOff, Volume2, X, Sparkles, ShoppingBag, Check, AlertCircle, RefreshCw, ExternalLink, Send, Keyboard } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "../lib/supabaseClient";
import { VoiceResolver } from "../services/voice/voiceResolver";
import { setCustomVoiceRules } from "../services/voiceAssistantService";
import { formatPrice } from "../lib/format";
import { formatCartCommittedText, formatCartCancelledText } from "../services/voice/responses";
import type { Product } from "../types";

export type AssistantLanguage = "en" | "hi" | "hinglish";

type Message = {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: Date;
  candidateProducts?: Product[];
  pendingConfirmation?: {
    product: Product;
    productName: string;
    size: string;
    quantity: number;
  };
};

type AssistantState = "idle" | "listening" | "thinking" | "speaking" | "confirmation_pending" | "error";

const SPEECH_LANG_MAP: Record<AssistantLanguage, string> = {
  en: "en-IN",
  hi: "hi-IN",
  hinglish: "hi-IN",
};

const LANG_OPTIONS: { key: AssistantLanguage; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "hi", label: "हिं" },
  { key: "hinglish", label: "Hi-En" },
];

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, addToCart } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<AssistantState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState<AssistantLanguage>("en");
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const isSpeechSupported = typeof window !== "undefined" && Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Namaste! I am your Uphar shopping assistant. Ask for Kajal, Serum, Bangles, or tell me what to find.",
      timestamp: new Date(),
    },
  ]);

  const [pendingCartItem, setPendingCartItem] = useState<{
    product: Product;
    productName: string;
    size: string;
    quantity: number;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize VoiceResolver instance
  const resolverRef = useRef<VoiceResolver | null>(null);

  // Update catalog when products change (PROD-04: does not re-fetch voice training rules)
  useEffect(() => {
    if (!resolverRef.current) {
      resolverRef.current = new VoiceResolver(products);
    } else {
      resolverRef.current.updateCatalog(products);
    }
  }, [products]);

  // Fetch custom voice training rules once on mount (PROD-04)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("voice_training_rules")
          .select("id, spoken_term, actual_term, created_at");
        if (!cancelled && !error && Array.isArray(data)) {
          setCustomVoiceRules(data);
        }
      } catch {
        // Table might not exist yet before migration — ignore silently
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto scroll transcript window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, state]);

  // Handle language change
  const handleLanguageChange = useCallback((newLang: AssistantLanguage) => {
    setLanguage(newLang);
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
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
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
    },
    [language]
  );

  // Add message to chat log
  const addMessage = useCallback(
    (
      sender: "user" | "assistant" | "system",
      text: string,
      pendingItem?: any,
      candidateProducts?: Product[]
    ) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sender,
          text,
          timestamp: new Date(),
          pendingConfirmation: pendingItem,
          candidateProducts,
        },
      ]);
    },
    []
  );

  // Process User Input query using VoiceResolver
  const processQuery = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;

      addMessage("user", userText);
      setState("thinking");

      if (!resolverRef.current) {
        resolverRef.current = new VoiceResolver(products);
      }

      const result = resolverRef.current.resolve(userText);

      // Handle Page Navigation
      if (result.action === "NAVIGATE_PAGE" && result.matchedProduct) {
        navigate(`/product/${result.matchedProduct.id}`);
        addMessage("assistant", result.message, undefined, [result.matchedProduct]);
        speak(result.spokenText);
        return;
      }

      // Handle Cart Commitment
      if (result.action === "COMMITTED_CART" && result.matchedProduct) {
        const size = result.matchedProduct.sizes[0] || "Default";
        addToCart(result.matchedProduct.id, size, 1);
        setPendingCartItem(null);
        addMessage("assistant", result.message);
        speak(result.spokenText);
        return;
      }

      // Handle Prompt Confirmation
      if (result.action === "PROMPT_CONFIRMATION" && result.matchedProduct) {
        const size = result.matchedProduct.sizes[0] || "Default";
        const pending = {
          product: result.matchedProduct,
          productName: result.matchedProduct.name,
          size,
          quantity: 1,
        };
        setPendingCartItem(pending);
        setState("confirmation_pending");
        addMessage("assistant", result.message, pending, [result.matchedProduct]);
        speak(result.spokenText);
        return;
      }

      // Handle Display Products
      if (result.action === "DISPLAY_PRODUCTS") {
        setPendingCartItem(null);
        addMessage("assistant", result.message, undefined, result.candidateProducts);
        speak(result.spokenText);
        return;
      }

      // Default: Speak Info or Cancel
      setPendingCartItem(null);
      addMessage("assistant", result.message);
      speak(result.spokenText);
    },
    [addMessage, addToCart, navigate, products, speak]
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
    } catch {
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
  const handleConfirmAdd = (pending: { product: Product; productName: string; size: string; quantity: number }) => {
    addToCart(pending.product.id, pending.size, pending.quantity);
    resolverRef.current?.getContextManager().clearPendingConfirmation();
    setPendingCartItem(null);
    const msg = formatCartCommittedText(pending.product, language);
    addMessage("assistant", msg);
    speak(msg);
  };

  const handleCancelAdd = () => {
    const product = pendingCartItem?.product;
    resolverRef.current?.getContextManager().clearPendingConfirmation();
    setPendingCartItem(null);
    const msg = product ? formatCartCancelledText(product, language) : "Cancelled.";
    addMessage("assistant", msg);
    speak(msg);
  };

  // Toggle Panel Open/Close (Instant, no backend latency)
  const togglePanel = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else {
      stopListening();
      setIsOpen(false);
    }
  };

  // FUNC-04: Do not render Voice Assistant on admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

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
                <span className="text-[11px] text-[#B76E79]">✦ Ready to Assist</span>
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

                  {/* Candidate Product Cards */}
                  {msg.candidateProducts && msg.candidateProducts.length > 0 && (
                    <div className="mt-2.5 flex flex-col gap-1.5 border-t border-white/10 pt-2">
                      {msg.candidateProducts.slice(0, 3).map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-white/5 p-2 transition hover:bg-white/10"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            {prod.images?.[0] && (
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="h-9 w-9 rounded-md object-cover"
                              />
                            )}
                            <div className="overflow-hidden">
                              <p className="truncate text-[11px] font-medium text-white">{prod.name}</p>
                              <p className="text-[10px] text-[#B76E79] font-semibold">{formatPrice(prod.price)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigate(`/product/${prod.id}`);
                              resolverRef.current?.getContextManager().setActiveProduct(prod);
                            }}
                            className="flex items-center gap-1 rounded bg-[#B76E79] px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-[#B76E79]/80"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Confirmation Action Buttons */}
                  {msg.pendingConfirmation && (
                    <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5">
                      <button
                        type="button"
                        onClick={() => handleConfirmAdd(msg.pendingConfirmation!)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#B76E79] px-3 py-1.5 font-semibold text-white transition hover:bg-[#B76E79]/80"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Yes, Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAdd}
                        className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        Cancel
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
          <div className="flex flex-col gap-2.5 bg-[#003D3B] p-3 border-t border-white/10">
            {/* Fallback Text Input (FUNC-03): Visible when speech unsupported, on error, or when toggled */}
            {(!isSpeechSupported || errorMessage || showTextInput) && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const query = textInput.trim();
                  if (query && state !== "thinking") {
                    setTextInput("");
                    processQuery(query);
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={state === "thinking"}
                  placeholder={
                    language === "hi"
                      ? "यहाँ कमांड लिखें (उदा. Kajal dikhao)..."
                      : language === "hinglish"
                      ? "Command type karein (e.g. Kajal dikhao)..."
                      : "Type a command (e.g. Show kajal)..."
                  }
                  className="flex-1 rounded-xl bg-white/10 px-3.5 py-2 text-xs text-white placeholder-white/40 border border-white/10 focus:border-[#B76E79] focus:outline-none disabled:opacity-50"
                  aria-label="Command text input fallback"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || state === "thinking"}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#B76E79] text-white transition hover:bg-[#B76E79]/90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  aria-label="Send text command"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}

            <div className="flex items-center justify-between gap-2">
              {isSpeechSupported ? (
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
                        ? language === "hi"
                          ? "रोकें और बोलें"
                          : language === "hinglish"
                          ? "Roko aur bolo"
                          : "Interrupt & Speak"
                        : language === "hi"
                        ? "बोलने के लिए दबाएँ"
                        : language === "hinglish"
                        ? "Bolne ke liye dabao"
                        : "Tap to Speak"}
                    </>
                  )}
                </button>
              ) : (
                <div className="flex-1 text-center text-xs text-white/60 py-1">
                  {language === "hi" ? "ऊपर कमांड लिखें" : language === "hinglish" ? "Upar command type karein" : "Type commands above"}
                </div>
              )}

              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={() => setShowTextInput((prev) => !prev)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label={showTextInput ? "Hide text input" : "Type instead of speaking"}
                  title={showTextInput ? "Hide text input" : "Type instead of speaking"}
                >
                  <Keyboard className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
