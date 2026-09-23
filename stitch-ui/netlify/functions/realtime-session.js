import { createClient } from "@supabase/supabase-js";

// Helper to determine allowed origin (SEC-02)
export function getAllowedOrigin(originHeader) {
  if (!originHeader) return null;
  const normalized = originHeader.trim().toLowerCase().replace(/\/$/, "");

  // Explicitly trusted production and development origins
  const trustedOrigins = new Set([
    "https://uphar-app-v01.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);

  // Environment-configured origins (exact match only — no broad wildcards or substrings)
  const envOrigins = [
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.APP_URL,
  ]
    .filter(Boolean)
    .map((u) => u.trim().toLowerCase().replace(/\/$/, ""));

  for (const envOrigin of envOrigins) {
    trustedOrigins.add(envOrigin);
  }

  if (trustedOrigins.has(normalized)) {
    return originHeader;
  }

  return null;
}

export async function handler(event, context) {
  const requestOrigin = event.headers.origin || event.headers.Origin || "";
  const allowedOrigin = getAllowedOrigin(requestOrigin);

  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  // Handle CORS Preflight
  if (event.httpMethod === "OPTIONS") {
    if (requestOrigin && !allowedOrigin) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "Forbidden: Origin not allowed" }),
      };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ message: "OK" }) };
  }

  // Enforce POST method only
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed. Realtime session creation requires POST." }),
    };
  }

  // Block cross-site request forgery if sec-fetch-site is explicitly cross-site
  const secFetchSite = event.headers["sec-fetch-site"] || event.headers["Sec-Fetch-Site"];
  if (secFetchSite === "cross-site") {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: "Forbidden: Cross-site requests are prohibited." }),
    };
  }

  // Enforce Endpoint Authentication / Authorization (SEC-03)
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        status: "error",
        message: "Unauthorized: Missing or invalid Authorization header.",
      }),
    };
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  // Validate token structure (must be a non-trivial bearer token, e.g. JWT format)
  if (!token || token.length < 20 || token.split(".").length !== 3) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        status: "error",
        message: "Unauthorized: Invalid authorization token format.",
      }),
    };
  }

  // Cryptographic token verification via Supabase Auth (SEC-03)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: userData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !userData?.user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            status: "error",
            message: "Unauthorized: Invalid or expired authentication token.",
          }),
        };
      }
    } catch {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          status: "error",
          message: "Unauthorized: Authentication verification failed.",
        }),
      };
    }
  } else {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: "error",
        message: "Server configuration error: Authentication service unavailable.",
      }),
    };
  }

  // PROD-02: Deactivate OpenAI Realtime path. Storefront Voice Assistant operates on local deterministic engine.
  // The unverified OpenAI realtime model identifier is not used.
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: "fallback",
      message: "OpenAI Realtime session endpoint is deactivated. Storefront Voice Assistant operates on the local deterministic engine.",
    }),
  };
}
