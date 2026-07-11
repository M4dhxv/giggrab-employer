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
      // ─ 1. Verify ─
      full_name: { type: ['string', 'null'], description: 'Full name as stated.' },
      candidate_location: { type: ['string', 'null'], description: 'Town/city they are based in.' },
      // ─ 2. Background ─
      recent_job: { type: ['string', 'null'], description: 'Brief note on their most recent job.' },
      cleaning_experience: { type: ['string', 'null'], description: "Type(s) of cleaning: 'commercial', 'residential', 'office', 'hospitality', 'healthcare', etc." },
      years_experience: { type: ['integer', 'null'], minimum: 0 },
      // ─ 3. Availability ─
      currently_working: { type: ['boolean', 'null'] },
      employment_type: { type: ['string', 'null'], enum: ['full_time', 'part_time', 'either', null] },
      notice_period: { type: ['string', 'null'] },
      earliest_start_date: { type: ['string', 'null'], description: 'ISO date YYYY-MM-DD if a concrete date was given, else null.' },
      unavailable_times: { type: ['string', 'null'], description: 'Any days/hours they said they cannot work.' },
      // ─ 4. Practical ─
      comfortable_with_travel: { type: ['boolean', 'null'], description: 'Happy travelling to different locations/sites.' },
      driving_licence: { type: ['boolean', 'null'] },
      own_transport: { type: ['boolean', 'null'] },
      right_to_work: { type: ['boolean', 'null'], description: 'Has the right to work in the UK.' },
      certifications: { type: 'array', items: { type: 'string' }, description: 'Any certifications/licences they mentioned, verbatim.' },
      // ─ 5. Motivation ─
      motivation: { type: ['string', 'null'], description: 'Briefly, why they applied / what interests them.' },
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

const SYSTEM = `You extract structured data from a FineClean 1st-stage cleaner-screening call transcript. This is an information-gathering screen — the hiring team makes the decision, not the screener.
STRICT: only record what the candidate actually said. Never infer or invent right-to-work, experience, availability, dates, or times. If a field wasn't covered, use null (or an empty array) and add it to missing_information. Dates must be ISO YYYY-MM-DD or null — do not guess a year.

recommendation is a routing signal for the hiring team, not a hiring decision:
- "reject" only if the candidate clearly does NOT have the right to work in the UK (right_to_work is false). Put that in concerns.
- "hold" if right_to_work or another key item (cleaning experience, availability) wasn't covered or is unclear — list what's missing in missing_information.
- "interview" or "shortlist" if they pass right-to-work and look like a reasonable fit (relevant experience + workable availability). Prefer "interview" for the strongest.
Keep the summary factual and short — lead with experience, availability and right-to-work.`;

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
        // verify
        full_name: x.full_name ?? null,
        candidate_location: x.candidate_location ?? null,
        // background
        recent_job: x.recent_job ?? null,
        cleaning_experience: x.cleaning_experience ?? null,
        years_experience: x.years_experience ?? null,
        // availability
        currently_working: x.currently_working ?? null,
        employment_type: x.employment_type ?? null,
        notice_period: x.notice_period ?? null,
        earliest_start_date: x.earliest_start_date ?? null,
        unavailable_times: x.unavailable_times ?? null,
        // practical
        comfortable_with_travel: x.comfortable_with_travel ?? null,
        driving_licence: x.driving_licence ?? null,
        own_transport: x.own_transport ?? null,
        right_to_work: x.right_to_work ?? null,
        certifications: (x.certifications as string[]) ?? [],
        // motivation
        motivation: x.motivation ?? null,
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
