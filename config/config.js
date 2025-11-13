// Load Supabase configuration from environment variables
// For local development: Create a .env file with your credentials
// For production: Set environment variables on your hosting platform
const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url'),
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key')
};

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.error('❌ ERROR: Supabase credentials not configured. Please check your .env file or environment variables.');
}

window.SUPABASE_CONFIG = SUPABASE_CONFIG;