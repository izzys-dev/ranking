// Supabase Configuration
// Load from window object (set in config.local.js) or use fallback
const SUPABASE_CONFIG = {
    url: window.SUPABASE_URL || 'https://kthdvnqdsczzbwpirbhl.supabase.co',
    anonKey: window.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aGR2bnFkc2N6emJ3cGlyYmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzMyMTUsImV4cCI6MjA3ODAwOTIxNX0.-QCI7Sp3IKeZnnvPdoG1087k--IKemtGhQCf729C7uw'
};

window.SUPABASE_CONFIG = SUPABASE_CONFIG;