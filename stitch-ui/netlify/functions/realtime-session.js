import https from "https";

export async function handler(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: JSON.stringify({ message: "OK" }) };
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

  // Server-side diagnostic log only (never returned to browser)
  const keyPrefix = apiKey.substring(0, 7) + "..." + apiKey.substring(apiKey.length - 4);
  console.log(`[realtime-session] Processing session request with key prefix ${keyPrefix}`);

  try {
    // GA Realtime API: POST /v1/realtime/client_secrets
    // GA schema: voice in audio.output, formats in audio.input/output.format
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
      console.warn(`[realtime-session] OpenAI API returned status ${response.statusCode}: ${response.body}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "fallback",
          message: `OpenAI API returned status ${response.statusCode}`,
          details: response.body,
        }),
      };
    }
  } catch (error) {
    console.error(`[realtime-session] Exception creating session: ${error.message}`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "fallback",
        message: error.message || "Failed to create realtime session",
      }),
    };
  }
}
