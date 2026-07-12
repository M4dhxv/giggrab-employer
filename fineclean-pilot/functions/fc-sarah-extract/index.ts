// fc-sarah-extract — post-call structured extraction. Port of gig-grab's
// profile.ts extractProfile: reads the fc_transcript_messages for a completed
// screening session and asks Claude (Sonnet) to produce BOTH the structured
// candidate answers (-> fc_candidate_structured_responses) and a recruiter-
// facing summary (-> fc_ai_summaries), in one tool call.
//
// Invoked by fc-twilio-status on the `completed` transition (service-role
// bearer). Idempotent via upsert on session_id.
//
// Env: ANTHROPIC_API_KEY, optional ANTHROPIC_MODEL (default claude-sonnet-5).
import { json, err } from '../_shared/cors.ts';
import { adminClient, logEvent } from '../_shared/db.ts';

const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-5';

// Single tool schema — mirrors fc_candidate_structured_responses +
// fc_ai_summaries so the write is a direct field map.
const TOOL = {
  name: 'record_screening',
  description: 'Record the structured outcome of the FineClean phone screening.',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      // Recruiter screening questions
      right_to_work: { type: ['boolean', 'null'], description: 'Has the right to work in the UK. true=yes, false=no, null=not asked/unclear.' },
      right_to_work_basis: { type: ['string', 'null'], enum: ['passport', 'visa', 'share_code', 'other', null], description: 'What their right to work is based on.' },
      right_to_work_expiry: { type: ['string', 'null'], description: 'If time-limited (visa/share code), when it expires — verbatim or ISO date, else null.' },
      transport_to_site: { type: ['string', 'null'], description: 'How they would get to the Worcester meeting point (4 Lowesmoor Wharf) and how early they could be there, verbatim.' },
      can_reach_site: { type: ['boolean', 'null'], description: 'Overall, can they reliably get to the Worcester meeting point in time. true/false/null.' },
      comfortable_with_travel: { type: ['boolean', 'null'], description: 'Comfortable travelling to varied Worcestershire sites (transport provided).' },
      physical_comfort: { type: ['boolean', 'null'], description: 'Comfortable with the physical demands (on feet, bending, lifting, cleaning products).' },
      chemical_sensitivities: { type: ['string', 'null'], description: 'Any allergies/sensitivities to cleaning chemicals they mentioned; "none" if they said none, null if not asked.' },
      available_days: { type: 'array', items: { type: 'string' }, description: "Days they can work, verbatim: 'Monday','Saturday', etc." },
      earliest_start_time: { type: ['string', 'null'], description: "Earliest time they can start, e.g. '07:00', '8am'." },
      latest_finish_time: { type: ['string', 'null'], description: 'Latest time they can work until.' },
      shift_notice: { type: ['string', 'null'], enum: ['same_day', '24h', '48h', 'more_than_48h', null], description: 'Notice needed to accept a shift.' },
      earliest_start_date: { type: ['string', 'null'], description: 'How soon they could start — ISO date YYYY-MM-DD if concrete, else null.' },
      summary: { type: 'string', description: '1–2 sentence neutral recruiter summary, third person. Only facts stated on the call.' },
      strengths: { type: 'array', items: { type: 'string' } },
      concerns: { type: 'array', items: { type: 'string' } },
      missing_information: { type: 'array', items: { type: 'string' }, description: 'Categories the candidate did not answer.' },
      recommendation: { type: 'string', enum: ['shortlist', 'interview', 'reject', 'hold'] },
      confidence_score: { type: 'number', minimum: 0, maximum: 1 },
    },
    required: ['summary', 'recommendation', 'confidence_score'],
  },
} as const;

const SYSTEM = `You extract structured data from a FineClean 1st-stage cleaner qualification-screening call transcript. This is an information-gathering filter — the hiring team makes the decision, not the screener.
STRICT: only record what the candidate actually said. Never infer or invent right-to-work, ability to reach the site, availability, dates, or times. If a field wasn't covered, use null (or empty array) and add it to missing_information. Dates must be ISO YYYY-MM-DD or null — do not guess a year.

recommendation is a routing signal, not a hiring decision:
- "reject" if the candidate clearly has NO right to work documentation (right_to_work is false), OR clearly cannot get to the Worcester meeting point (can_reach_site is false). Put the reason in concerns.
- "it depends on the start time" for reaching the site → set can_reach_site to null and use "hold", not reject.
- "hold" if right-to-work or reaching-the-site wasn't covered / is unclear — list what's missing in missing_information.
- otherwise "interview" or "shortlist" based on how well their availability/notice/start-date fit. Prefer "interview" for the strongest.
Keep the summary factual and short — lead with right-to-work, getting to the site, and availability.`;

Deno.serve(async (req) => {
  try {
    const { session_id } = await req.json();
    if (!session_id) return err('session_id required');

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return err('ANTHROPIC_API_KEY not set', 500);

    const db = adminClient();

    const { data: session } = await db
      .from('fc_screening_sessions')
      .select('id, candidate_id')
      .eq('id', session_id)
      .single();
    if (!session) return err('Session not found', 404);

    // Skip if we've already extracted for this session.
    const { data: existing } = await db
      .from('fc_candidate_structured_responses')
      .select('id')
      .eq('session_id', session_id)
      .maybeSingle();
    if (existing) return json({ success: true, skipped: 'already extracted' });

    const { data: turns } = await db
      .from('fc_transcript_messages')
      .select('speaker, message, sequence_number')
      .eq('session_id', session_id)
      .order('sequence_number', { ascending: true });

    if (!turns || turns.length === 0) {
      return json({ success: false, reason: 'no transcript' });
    }

    const transcript = turns
      .map((t) => `${t.speaker === 'sarah' ? 'Sarah' : 'Candidate'}: ${t.message}`)
      .join('\n');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'record_screening' },
        messages: [{ role: 'user', content: `Transcript:\n\n${transcript}` }],
      }),
    });

    if (!res.ok) {
      console.error('Anthropic error:', res.status, await res.text());
      return err('Extraction failed', 502);
    }

    const data = await res.json();
    const toolUse = (data.content ?? []).find((c: { type: string }) => c.type === 'tool_use');
    if (!toolUse) return err('No structured output', 502);
    const x = toolUse.input as Record<string, unknown>;

    // -> fc_candidate_structured_responses
    const { error: srErr } = await db.from('fc_candidate_structured_responses').upsert(
      {
        session_id,
        candidate_id: session.candidate_id,
        // recruiter screening answers
        right_to_work: x.right_to_work ?? null,
        right_to_work_basis: x.right_to_work_basis ?? null,
        right_to_work_expiry: x.right_to_work_expiry ?? null,
        transport_to_site: x.transport_to_site ?? null,
        can_reach_site: x.can_reach_site ?? null,
        comfortable_with_travel: x.comfortable_with_travel ?? null,
        physical_comfort: x.physical_comfort ?? null,
        chemical_sensitivities: x.chemical_sensitivities ?? null,
        available_days: (x.available_days as string[]) ?? [],
        earliest_start_time: x.earliest_start_time ?? null,
        latest_finish_time: x.latest_finish_time ?? null,
        shift_notice: x.shift_notice ?? null,
        earliest_start_date: x.earliest_start_date ?? null,
      },
      { onConflict: 'session_id' },
    );
    if (srErr) console.error('structured upsert:', srErr.message);

    // -> fc_ai_summaries
    const { error: aiErr } = await db.from('fc_ai_summaries').upsert(
      {
        session_id,
        candidate_id: session.candidate_id,
        summary: x.summary ?? null,
        strengths: (x.strengths as string[]) ?? [],
        concerns: (x.concerns as string[]) ?? [],
        missing_information: (x.missing_information as string[]) ?? [],
        recommendation: x.recommendation ?? null,
        confidence_score: x.confidence_score ?? null,
      },
      { onConflict: 'session_id' },
    );
    if (aiErr) console.error('ai_summary upsert:', aiErr.message);

    if (session.candidate_id) {
      await logEvent(db, session.candidate_id, 'Sarah Screening Extracted', {
        session_id,
        recommendation: x.recommendation,
        confidence_score: x.confidence_score,
      });
    }

    return json({ success: true, recommendation: x.recommendation });
  } catch (e) {
    console.error('fc-sarah-extract:', e);
    return err('Internal error', 500);
  }
});
