const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://vqinoqumoirrptobxhvk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxaW5vcXVtb2lycnB0b2J4aHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTgyMTYsImV4cCI6MjA5MDQzNDIxNn0.xEzDFWAlITH3hHyvJlP9Ka69VIGiP_eDav-TMJ_vj98'
)

async function run() {
  const { data: d1, error: e1 } = await supabase.auth.signUp({
    email: 'admin@uphar.com',
    password: 'password123'
  })
  if (e1) console.error('Admin signup error:', e1)
  else console.log('Admin user created:', d1.user ? d1.user.id : 'Already exists')

  const { data: d2, error: e2 } = await supabase.auth.signUp({
    email: 'customer@uphar.com',
    password: 'password123'
  })
  if (e2) console.error('Customer signup error:', e2)
  else console.log('Customer user created:', d2.user ? d2.user.id : 'Already exists')
}
run()
