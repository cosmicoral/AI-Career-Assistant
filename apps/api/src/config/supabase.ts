import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, requireSupabaseConfig } from "./env";

let adminClient: SupabaseClient | null = null;
let authClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  requireSupabaseConfig();

  if (!adminClient) {
    adminClient = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return adminClient;
}

export function getSupabaseAuthClient() {
  requireSupabaseConfig();

  if (!authClient) {
    authClient = createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return authClient;
}
