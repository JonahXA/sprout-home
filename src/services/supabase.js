import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Sprout] Missing Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). " +
    "Auth and database features will be unavailable. " +
    "Add these to your .env file for full functionality."
  );
}

// Use placeholder values when env vars are missing so the app can still
// render locally. All Supabase calls will fail gracefully (return errors
// instead of throwing), and the auth layer falls back to localStorage.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);