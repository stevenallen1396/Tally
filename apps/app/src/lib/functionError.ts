import { FunctionsHttpError } from "@supabase/supabase-js";

// supabase-js's FunctionsHttpError.message is a generic
// "Edge Function returned a non-2xx status code" — the actual error text an
// edge function sent back only lives in error.context (the raw Response),
// and has to be parsed out explicitly.
export async function functionErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      return body?.error ?? body?.message ?? fallback;
    } catch {
      return fallback;
    }
  }
  return error instanceof Error ? error.message : fallback;
}
