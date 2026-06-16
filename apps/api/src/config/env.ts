import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_ORIGIN: z.string().default("http://localhost:5173"),
  SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional()
});

export const env = EnvSchema.parse(process.env);

export const isSupabaseConfigured =
  Boolean(env.SUPABASE_URL) &&
  Boolean(env.SUPABASE_ANON_KEY) &&
  Boolean(env.SUPABASE_SERVICE_ROLE_KEY);

export const isOpenAiConfigured = Boolean(env.OPENAI_API_KEY);

export function requireSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw Object.assign(new Error("Supabase environment variables are not configured."), {
      statusCode: 503
    });
  }
}

export function requireOpenAiConfig() {
  if (!isOpenAiConfigured) {
    throw Object.assign(new Error("OpenAI API key is not configured."), {
      statusCode: 503
    });
  }
}
