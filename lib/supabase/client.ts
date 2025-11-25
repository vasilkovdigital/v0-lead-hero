import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log("[v0] Creating Supabase client with URL:", supabaseUrl ? "present" : "MISSING")
  console.log("[v0] Anon key:", supabaseAnonKey ? "present" : "MISSING")

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
