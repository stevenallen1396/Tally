import Anthropic from "npm:@anthropic-ai/sdk@^0.70";
import { zodOutputFormat } from "npm:@anthropic-ai/sdk@^0.70/helpers/zod";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@^3.25";

import { corsHeaders, handleCors } from "../_shared/cors.ts";

const ParsedEntrySchema = z.object({
  amount_minor: z.number().int().positive(),
  direction: z.enum(["i_owe", "they_owe"]),
  note: z.string(),
  name_mismatch: z.boolean(),
  confidence: z.enum(["high", "medium", "low"]),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing Authorization header" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return json({ error: "Invalid session" }, 401);
  }

  let tally_id: string | undefined;
  let raw_text: string | undefined;
  try {
    ({ tally_id, raw_text } = await req.json());
  } catch {
    // fall through to the validation below
  }
  if (!tally_id || !raw_text?.trim()) {
    return json({ error: "Missing tally_id or raw_text" }, 400);
  }

  // RLS-scoped: only returns a row if `user` is actually a member of this
  // tally. A tally always has exactly two members, so the counterparty is
  // never ambiguous — the name in the sentence is only sanity-checked
  // against it, never searched for.
  const { data: otherMember } = await userClient
    .from("tally_members")
    .select("user_id")
    .eq("tally_id", tally_id)
    .neq("user_id", user.id)
    .maybeSingle();

  if (!otherMember) {
    return json({ error: "Not a member of this tally, or no partner has joined yet" }, 400);
  }

  const { data: partnerProfile } = await userClient
    .from("profiles")
    .select("display_name")
    .eq("id", otherMember.user_id)
    .maybeSingle();
  const partnerName = partnerProfile?.display_name ?? "your tally partner";

  const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
  const model = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-haiku-4-5";

  const response = await anthropic.messages.parse({
    model,
    max_tokens: 1024,
    system:
      `You turn a short sentence about a shared expense into a structured record for a two-person IOU ledger app called Tally. ` +
      `The user's tally partner is named "${partnerName}". The currency is always GBP. ` +
      `"amount_minor" is the amount in pence (e.g. £5 -> 500). ` +
      `"direction" is "they_owe" if the partner now owes the user money, or "i_owe" if the user now owes the partner money. ` +
      `"note" is a short (under 6 words) description of what the money was for. ` +
      `"name_mismatch" is true only if the sentence names a specific person who is clearly NOT "${partnerName}" (a plain pronoun or no name at all is not a mismatch). ` +
      `"confidence" reflects how sure you are about the amount and direction specifically.`,
    messages: [{ role: "user", content: raw_text }],
    output_config: { format: zodOutputFormat(ParsedEntrySchema) },
  });

  if (!response.parsed_output) {
    return json({ error: "Could not understand that — try rephrasing or use Manual." }, 422);
  }

  return json(response.parsed_output);
});
