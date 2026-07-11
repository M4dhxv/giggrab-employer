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
      // ─ Qualification filter (primary screen) ─
      right_to_work: { type: ['boolean', 'null'], description: 'true if they have valid right-to-work documentation; false if no; null if not asked.' },
      right_to_work_status: { type: ['string', 'null'], enum: ['yes', 'with_restrictions', 'no', 'unsure', null] },
      can_reach_site: { type: ['boolean', 'null'], description: 'Can reliably reach the Worcester meeting/pick-up point (4 Lowesmoor Wharf). true=yes, false=no, null if "depends on start time"/unclear.' },
      comfortable_with_travel: { type: ['boolean', 'null'], description: 'Comfortable travelling to varied Worcestershire sites (transport provided from the meeting point).' },
      available_days: { type: 'array', items: { type: 'string' }, description: "Days they can work, verbatim: 'Monday','Saturday', etc." },
      earliest_start_time: { type: ['string', 'null'], description: "Earliest time they can start, e.g. '06:30', '7am'." },
      latest_finish_time: { type: ['string', 'null'], description: 'Latest time they can finish.' },
      can_work_required_hours: { type: ['boolean', 'null'], description: 'Optional — only if the call discussed specific required hours.' },
      shift_notice: { type: ['string', 'null'], enum: ['same_day', '24h', '48h', 'more_than_48h', null], description: 'Notice needed to accept a shift.' },
      earliest_start_date: { type: ['string', 'null'], description: 'ISO date YYYY-MM-DD if a concrete date was given, else null.' },
      notice_period: { type: ['string', 'null'] },
      // ─ Legacy / optional (may be null if not asked) ─
      years_experience: { type: ['integer', 'null'], minimum: 0 },
      cleaning_experience: { type: ['string', 'null'] },
      weekend_availability: { type: ['boolean', 'null'] },
      preferred_hours: { type: ['string', 'null'] },
      preferred_locations: { type: 'array', items: { type: 'string' } },
      own_transport: { type: ['boolean', 'null'] },
      driving_licence: { type: ['boolean', 'null'] },
      english_level: { type: ['string', 'null'], enum: ['basic', 'conversational', 'fluent', 'native', null] },
      expected_pay_hourly: { type: ['number', 'null'], description: 'Hourly rate in GBP.' },
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

const SYSTEM = `You extract structured hiring data from a FineClean cleaner qualification-screening call transcript.
STRICT: only record what the candidate actually said. Never infer or invent right-to-work, ability to reach the site, availability, dates, or times. If a field wasn't covered, use null (or an empty array) and add it to missing_information. Dates must be ISO YYYY-MM-DD or null — do not guess a year.

This is a QUALIFICATION FILTER. Set recommendation using these hard gates first:
- recommendation = "reject" if EITHER: right_to_work is false (no valid right-to-work documentation), OR can_reach_site is false (cannot reliably get to the Worcester meeting/pick-up point). Put the failing reason in concerns.
- "It depends on the start time" for getting to the meeting point is NOT a reject — set can_reach_site to null and use "hold".
- If a hard-gate field is null because it wasn't asked/answered, do NOT reject on it — use "hold" and list it in missing_information.
- Otherwise (passes the gates), use "shortlist" or "interview" based on overall fit; use "hold" if key availability is unclear.
Keep the summary factual and short.`;

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
        // qualification filter
        right_to_work: x.right_to_work ?? null,
        right_to_work_status: x.right_to_work_status ?? null,
        can_reach_site: x.can_reach_site ?? null,
        comfortable_with_travel: x.comfortable_with_travel ?? null,
        available_days: (x.available_days as string[]) ?? [],
        earliest_start_time: x.earliest_start_time ?? null,
        latest_finish_time: x.latest_finish_time ?? null,
        can_work_required_hours: x.can_work_required_hours ?? null,
        shift_notice: x.shift_notice ?? null,
        earliest_start_date: x.earliest_start_date ?? null,
        notice_period: x.notice_period ?? null,
        // legacy / optional
        years_experience: x.years_experience ?? null,
        cleaning_experience: x.cleaning_experience ?? null,
        weekend_availability: x.weekend_availability ?? null,
        preferred_hours: x.preferred_hours ?? null,
        preferred_locations: (x.preferred_locations as string[]) ?? [],
        own_transport: x.own_transport ?? null,
        driving_licence: x.driving_licence ?? null,
        english_level: x.english_level ?? null,
        expected_pay_hourly: x.expected_pay_hourly ?? null,
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
