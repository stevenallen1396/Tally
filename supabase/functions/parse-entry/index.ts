import { GoogleGenAI } from "npm:@google/genai@^1";
import { withSupabase } from "npm:@supabase/server@^1";

const PARSED_ENTRY_SCHEMA = {
  type: "OBJECT",
  properties: {
    amount_minor: { type: "INTEGER" },
    direction: { type: "STRING", enum: ["i_owe", "they_owe"] },
    note: { type: "STRING" },
    name_mismatch: { type: "BOOLEAN" },
    confidence: { type: "STRING", enum: ["high", "medium", "low"] },
  },
  required: ["amount_minor", "direction", "note", "name_mismatch", "confidence"],
};

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const supabase = ctx.supabase;
    const userId = ctx.userClaims.id;

    let tally_id: string | undefined;
    let raw_text: string | undefined;
    try {
      ({ tally_id, raw_text } = await req.json());
    } catch {
      // fall through to the validation below
    }
    if (!tally_id || !raw_text?.trim()) {
      return Response.json({ error: "Missing tally_id or raw_text" }, { status: 400 });
    }

    // RLS-scoped: only returns a row if the caller is actually a member of
    // this tally.
    const { data: ownMembership } = await supabase
      .from("tally_members")
      .select("user_id")
      .eq("tally_id", tally_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!ownMembership) {
      return Response.json({ error: "Not a member of this tally" }, { status: 400 });
    }

    // A tally always has at most two members, so the counterparty is never
    // ambiguous — the name in the sentence is only sanity-checked against
    // it, never searched for. No buddy yet just means no check to make.
    const { data: otherMember } = await supabase
      .from("tally_members")
      .select("user_id")
      .eq("tally_id", tally_id)
      .neq("user_id", userId)
      .maybeSingle();

    let partnerName = "your buddy";
    if (otherMember) {
      const { data: partnerProfile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", otherMember.user_id)
        .maybeSingle();
      partnerName = partnerProfile?.display_name ?? "your buddy";
    }

    const genai = new GoogleGenAI({ apiKey: Deno.env.get("GEMINI_API_KEY") });
    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-flash-lite-latest";

    const systemInstruction =
      `You turn a short sentence about a shared expense into a structured record for a two-person IOU ledger app called Talli. ` +
      (otherMember
        ? `The user's buddy is named "${partnerName}". `
        : `The user's buddy hasn't joined the tally yet, so their real name isn't known — never flag a name_mismatch for this reason. `) +
      `The currency is always GBP. ` +
      `"amount_minor" is the amount in pence (e.g. £5 -> 500). ` +
      `"direction" is "they_owe" if the buddy now owes the user money, or "i_owe" if the user now owes the buddy money. ` +
      `"note" is a short (under 6 words) description of what the money was for. ` +
      (otherMember
        ? `"name_mismatch" is true only if the sentence names a specific person who is clearly NOT "${partnerName}" (a plain pronoun or no name at all is not a mismatch). `
        : `"name_mismatch" should always be false. `) +
      `"confidence" reflects how sure you are about the amount and direction specifically.`;

    const response = await genai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: raw_text }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: PARSED_ENTRY_SCHEMA,
        maxOutputTokens: 512,
      },
    });

    let parsedOutput: unknown = null;
    try {
      parsedOutput = JSON.parse(response.text ?? "");
    } catch {
      parsedOutput = null;
    }

    if (!parsedOutput) {
      return Response.json({ error: "Could not understand that — try rephrasing or use Manual." }, { status: 422 });
    }

    return Response.json(parsedOutput);
  }),
};
