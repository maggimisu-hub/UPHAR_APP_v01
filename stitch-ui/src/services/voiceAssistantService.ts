import { supabase } from "../lib/supabaseClient";

// Re-export modular v2.0 voice engine
export * from "./voice/types";
export * from "./voice/config";
export * from "./voice/normalization";
export * from "./voice/lexicon";
export * from "./voice/nlu";
export * from "./voice/catalogIndex";
export * from "./voice/contextManager";
export * from "./voice/responses";
export * from "./voice/voiceResolver";

// Legacy Language type compatibility
export type AssistantLanguage = "en" | "hi" | "hinglish";

// ─────────────────────────────────────────────────────
// Voice Training Rules Service
// ─────────────────────────────────────────────────────

export interface VoiceTrainingRule {
  id?: string;
  spoken_term: string;
  actual_term: string;
  created_at?: string;
}

let activeCustomRules: VoiceTrainingRule[] = [];

export function setCustomVoiceRules(rules: VoiceTrainingRule[]): void {
  activeCustomRules = Array.isArray(rules) ? rules : [];
}

export function getCustomVoiceRules(): VoiceTrainingRule[] {
  return activeCustomRules;
}

// ─────────────────────────────────────────────────────
// Fetch Realtime Session Token (Deactivated endpoint helper)
// ─────────────────────────────────────────────────────

/**
 * Fetch realtime session key from Netlify function endpoint.
 * Protected by authenticated user session check.
 */
export async function fetchRealtimeSessionToken(): Promise<{
  status: "success" | "fallback" | "error";
  client_secret?: string;
  model?: string;
  message?: string;
}> {
  try {
    let authToken = "";
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      authToken = sessionData?.session?.access_token || "";
    } catch {
      // Fallback if getSession fails
    }

    if (!authToken) {
      return {
        status: "fallback",
        message: "No authenticated user session available for realtime connection.",
      };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const res = await fetch("/.netlify/functions/realtime-session", {
      method: "POST",
      headers,
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
