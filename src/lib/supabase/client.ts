import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 * NEXT_PUBLIC_* vars must be read directly so Next.js inlines them into the client bundle.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local"
    );
  }

  return createBrowserClient(url, anonKey);
}
