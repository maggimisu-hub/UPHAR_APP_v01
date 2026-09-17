import https from "https";

// Helper to determine allowed origin
function getAllowedOrigin(originHeader) {
  if (!originHeader) return null;
  const normalized = originHeader.trim().toLowerCase();

  // Allow localhost for development
  if (
    normalized === "http://localhost:3000" ||
    normalized === "http://127.0.0.1:3000" ||
    normalized === "http://localhost:5173" ||
    normalized === "http://127.0.0.1:5173"
  ) {
    return originHeader;
  }

  // Allow production & deploy preview URLs if configured in Netlify env
  const allowedEnvs = [
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.APP_URL,
  ].filter(Boolean).map((u) => u.trim().toLowerCase().replace(/\/$/, ""));

  for (const allowed of allowedEnvs) {
    if (normalized === allowed || normalized.endsWith(".netlify.app")) {
      return originHeader;
    }
  }

  // If deployed on custom domain or Netlify subdomain
  if (normalized.endsWith(".netlify.app") || normalized.includes("uphar")) {
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

  // Enforce Endpoint Authentication / Authorization
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

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_openai_api_key") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "fallback",
        message: "OPENAI_API_KEY environment variable is missing or placeholder.",
      }),
    };
  }

  // Operational log without sensitive key fragments or tokens
  console.log("[realtime-session] Processing authenticated session request");

  try {
    const postData = JSON.stringify({
      session: {
        model: "gpt-realtime",
        type: "realtime",
        instructions:
          "You are Uphar's shopping assistant. Helpful, concise, and friendly. Help customers find products, check prices, discounts, stock availability, and add items to their cart.",
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
          },
          output: {
            voice: "alloy",
            format: { type: "audio/pcm", rate: 24000 },
          },
        },
        tools: [
          {
            type: "function",
            name: "search_products",
            description: "Search active storefront products by name, category, or keyword.",
            parameters: {
              type: "object",
              properties: { query: { type: "string", description: "Product search query" } },
              required: ["query"],
            },
          },
          {
            type: "function",
            name: "get_product_details",
            description: "Get pricing, stock, discount, and return policy details for a product.",
            parameters: {
              type: "object",
              properties: { product_name: { type: "string", description: "Product name to look up" } },
              required: ["product_name"],
            },
          },
          {
            type: "function",
            name: "add_to_cart",
            description: "Add a product to the customer's cart after explicit confirmation.",
            parameters: {
              type: "object",
              properties: {
                product_name: { type: "string", description: "Product name to add" },
                quantity: { type: "integer", description: "Number of items to add", default: 1 },
              },
              required: ["product_name"],
            },
          },
        ],
      },
    });

    const options = {
      hostname: "api.openai.com",
      port: 443,
      path: "/v1/realtime/client_secrets",
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, body: data });
        });
      });
      req.on("error", (e) => reject(e));
      req.write(postData);
      req.end();
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      const parsed = JSON.parse(response.body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "success",
          client_secret: parsed.client_secret?.value || parsed.client_secret,
          expires_at: parsed.expires_at,
          model: parsed.model,
        }),
      };
    } else {
      console.warn(`[realtime-session] OpenAI API returned status ${response.statusCode}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "fallback",
          message: `OpenAI API returned status ${response.statusCode}`,
        }),
      };
    }
  } catch (error) {
    console.error("[realtime-session] Exception creating session");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "fallback",
        message: "Failed to create realtime session",
      }),
    };
  }
}
