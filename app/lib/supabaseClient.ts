import { createBrowserClient } from "@supabase/ssr";

// Use fallback values to prevent Next.js build-time prerendering crashes when env vars are unset
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    "Supabase credentials missing. Using placeholders for build compilation. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment settings."
  );
}

// Cookie-based client so the session is also visible to middleware/server (required for route protection).
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
