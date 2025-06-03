import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
);

async function createAdminUser(email, password) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Skip email confirmation
    user_metadata: { role: 'admin' }
  });

  if (error) {
    console.error('Error creating admin user:', error);
    return;
  }

  console.log('Admin user created:', data);
}

// Call with your admin credentials
createAdminUser('admin@yourdomain.com', 'securepassword123');