import { createClient } from "@supabase/supabase-js";

export const getSupabase = () => {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_ANON_KEY (or their NEXT_PUBLIC equivalents)."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};
