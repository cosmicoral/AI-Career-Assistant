import { supabase } from "./supabase";

const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const token = await getAccessToken();

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  } else {
    headers.set("x-demo-user-id", "00000000-0000-4000-8000-000000000001");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
