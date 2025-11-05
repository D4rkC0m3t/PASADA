/**
 * Fix Client Account - Creates client record and links to user_profile
 * Run: node fix-client-account.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://eoahwxdhvdfgllolzoxd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYWh3eGRodmRmZ2xsb2x6b3hkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQxNDI0MywiZXhwIjoyMDc0OTkwMjQzfQ.Hsqye61t5Vn9hBCq21vg1jbVlLP0biITbmNQUnAasw8';

console.log('🔌 Connecting to Supabase...');
console.log('   URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixClientAccount() {
  const email = 'arjunin2020@gmail.com';
  
  console.log('🔧 Starting client account fix...\n');

  try {
    // Step 1: Get user from auth.users by email, then get profile
    console.log('📋 Step 1: Getting user by email...');
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error getting users:', userError);
      return;
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ No user found with email:', email);
      return;
    }

    console.log('✅ Found user:', user.email);
    console.log('   User ID:', user.id);

    // Step 2: Get user profile
    console.log('\n📋 Step 2: Getting user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error getting profile:', profileError);
      return;
    }

    if (!profile) {
      console.error('❌ No profile found for user ID:', user.id);
      return;
    }

    console.log('✅ Found profile');
    console.log('   Role:', profile.role);
    console.log('   Current client_id:', profile.client_id || 'NULL');

    // Step 3: Check if client already exists
    console.log('\n📋 Step 3: Checking for existing client record...');
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking client:', checkError);
      return;
    }

    let clientId;

    if (existingClient) {
      console.log('✅ Client already exists:', existingClient.name);
      clientId = existingClient.id;
    } else {
      // Step 4: Create client record
      console.log('\n📋 Step 4: Creating new client record...');
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: profile.full_name || user.email,
          contact_name: profile.full_name || user.email,
          email: user.email,
          phone: profile.phone,
          status: 'active',
          type: 'residential'
        })
        .select('id')
        .single();

      if (clientError) {
        console.error('❌ Error creating client:', clientError);
        return;
      }

      clientId = newClient.id;
      console.log('✅ Created client record with ID:', clientId);
    }

    // Step 5: Update user_profile with client_id
    console.log('\n📋 Step 5: Linking user profile to client...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        client_id: clientId,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      return;
    }

    console.log('✅ Successfully linked user profile to client!');

    // Step 6: Verify the fix
    console.log('\n📋 Step 6: Verifying the fix...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        role,
        client_id,
        full_name
      `)
      .eq('id', user.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
      return;
    }

    const { data: verifyClient } = await supabase
      .from('clients')
      .select('id, name, contact_name, status, email')
      .eq('id', verifyProfile.client_id)
      .single();

    console.log('\n✅ VERIFICATION SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:      ', user.email);
    console.log('User ID:    ', user.id);
    console.log('Role:       ', verifyProfile.role);
    console.log('Client ID:  ', verifyProfile.client_id);
    console.log('Client Name:', verifyClient?.name);
    console.log('Status:     ', verifyClient?.status);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 Your client dashboard should now work!');
    console.log('   Try accessing: http://localhost:3000/client/dashboard');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixClientAccount();
