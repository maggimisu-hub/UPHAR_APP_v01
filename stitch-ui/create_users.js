import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = 'https://vqinoqumoirrptobxhvk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxaW5vcXVtb2lycnB0b2J4aHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTgyMTYsImV4cCI6MjA5MDQzNDIxNn0.xEzDFWAlITH3hHyvJlP9Ka69VIGiP_eDav-TMJ_vj98';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createUser(email, password) {
  console.log(`\nCreating user: ${email}`);
  
  // Use signUp via anon client
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error(`  SignUp error: ${error.message}`);
    return null;
  }

  console.log(`  User created: ${data.user?.id}`);
  
  // Immediately sign in to verify
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInErr) {
    console.error(`  Sign-in verification failed: ${signInErr.message}`);
    return null;
  }

  console.log(`  Sign-in verified OK: ${signInData.user?.id}`);
  await supabase.auth.signOut();
  return signInData.user;
}

async function main() {
  // Create customer user
  const customer = await createUser("customer@uphar.com", "password123");
  
  if (customer) {
    // Insert public.users row and set role
    const { error: pubErr } = await supabase
      .from("users")
      .upsert({ id: customer.id, role: "customer", is_blocked: false }, { onConflict: "id" });
    if (pubErr) console.error("  public.users insert error:", pubErr.message);
    else console.log("  public.users row created");
  }

  // Create admin user
  const admin = await createUser("admin@uphar.com", "password123");
  
  if (admin) {
    const { error: pubErr } = await supabase
      .from("users")
      .upsert({ id: admin.id, role: "admin", is_blocked: false }, { onConflict: "id" });
    if (pubErr) console.error("  public.users insert error:", pubErr.message);
    else console.log("  public.users row created");
  }

  console.log("\nDone! Users ready for login.");
}

main().catch(console.error);
