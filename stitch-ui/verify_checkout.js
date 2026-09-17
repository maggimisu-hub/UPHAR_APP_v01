import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const email = process.env.TEST_CUSTOMER_EMAIL;
  const password = process.env.TEST_CUSTOMER_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing TEST_CUSTOMER_EMAIL / TEST_CUSTOMER_PASSWORD environment variables. Provide them to run checkout verification.");
  }

  console.log("--- Step 1: Sign in ---");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  const user = signInData.user;
  if (!user) throw new Error("No authenticated user session");
  console.log("User:", user.id);

  console.log("--- Step 2: Fetch products ---");
  const { data: products, error: pError } = await supabase
    .from("products")
    .select("id,name,product_variants(id,name,price)")
    .limit(1);

  if (pError) throw pError;
  if (!products?.length) throw new Error("No products found");

  const product = products[0];
  const variant = product.product_variants?.[0];
  if (!variant) throw new Error("No variant found");

  console.log("Product:", product.id, "Variant:", variant.id);

  console.log("--- Step 3: Add address ---");
  const { data: addressData, error: addressError } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      name: "Test Name",
      phone: "1234567890",
      address_line: "123 Test St",
      city: "Test City",
      pincode: "123456",
      is_default: false,
    })
    .select("id")
    .single();

  if (addressError) throw addressError;
  console.log("Address:", addressData.id);

  const payload = {
    user_id: user.id,
    address_id: addressData.id,
    payment_method: "cod",
    items: [{ product_id: product.id, variant_id: variant.id, quantity: 1 }],
  };

  console.log("--- Step 4: Call create_order_with_items ---");
  console.log("Payload:", JSON.stringify(payload, null, 2));
  const { data: rpcData, error: rpcError } = await supabase.rpc("create_order_with_items", {
    p_payload: payload,
  });

  if (rpcError) {
    console.error("RPC Error:", JSON.stringify(rpcError, null, 2));
    return;
  }

  console.log("RPC Success:", JSON.stringify(rpcData, null, 2));
}

main().catch((err) => {
  console.error("Fatal:", err?.message || err);
});
