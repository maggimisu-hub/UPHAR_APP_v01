import { createClient } from '@supabase/supabase-js';
const url = 'https://vqinoqumoirrptobxhvk.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxaW5vcXVtb2lycnB0b2J4aHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTgyMTYsImV4cCI6MjA5MDQzNDIxNn0.xEzDFWAlITH3hHyvJlP9Ka69VIGiP_eDav-TMJ_vj98';
const supabase = createClient(url, key);
(async () => {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    console.log({ data, error });
  } catch (err) {
    console.error('execution error', err);
  }
})();