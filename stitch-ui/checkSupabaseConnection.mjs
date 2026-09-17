import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(url, key);
(async () => {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    console.log({ data, error });
  } catch (err) {
    console.error('execution error', err);
  }
})();