# Sarah voice screening — FineClean (ported from gig-grab)

This is Frank's gig-grab voice pipeline, copied 1:1 and repointed at the
FineClean Supabase schema. Nothing about *how Sarah works* changed — only the
database it writes to and the questions she asks (cleaning-specific).

## Architecture (identical to gig-grab)

```
fc-request-screening (edge fn)
   places Twilio outbound call to the candidate
      → candidate answers → Twilio fetches fc-twilio-voice (TwiML)
         → <Connect><Stream> bridges call audio to the Pipecat agent (/ws)
            → Silero VAD → Deepgram Nova-3 (STT) → OpenAI gpt-4o-mini (Sarah) → Cartesia (TTS)
            → agent writes each turn to fc_transcript_messages, session status to fc_screening_sessions
   Twilio call-progress + recording → fc-twilio-status
      → on `completed` → fc-sarah-extract (Claude Sonnet)
         → fc_candidate_structured_responses + fc_ai_summaries
```

Two things deploy separately (same split as gig-grab: audio can't live in Supabase):
1. **Edge functions** (Deno) — in `functions/`, run on Supabase.
2. **Pipecat agent** (Python) — in `agent/`, runs on an always-on host (Cloud Run / Fly / Railway).

## 1. Deploy the edge functions

```bash
# Twilio hits these two directly, so they must be public (no Supabase JWT):
supabase functions deploy fc-twilio-voice   --no-verify-jwt
supabase functions deploy fc-twilio-status  --no-verify-jwt
# Internal (called with service-role bearer / your app):
supabase functions deploy fc-request-screening
supabase functions deploy fc-sarah-extract
```

### Edge-function secrets (`supabase secrets set ...`)
| Secret | Used by | Notes |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | request-screening | |
| `TWILIO_AUTH_TOKEN` | request-screening, twilio-status | also verifies webhook signatures |
| `TWILIO_PHONE_NUMBER` | request-screening | E.164 caller ID |
| `AGENT_WS_URL` | twilio-voice | `wss://<your-pipecat-host>/ws` |
| `ANTHROPIC_API_KEY` | sarah-extract | |
| `ANTHROPIC_MODEL` | sarah-extract | optional, default `claude-sonnet-5` |
| `FUNCTIONS_BASE_URL` | request-screening, twilio-status | optional; auto-derived from `SUPABASE_URL` |
| `FC_SKIP_TWILIO_SIGNATURE` | twilio-status | set `1` for local dev ONLY |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by Supabase automatically.

## 2. Deploy the Pipecat agent

```bash
cd agent
cp .env.example .env      # fill DATABASE_URL + DEEPGRAM/OPENAI/CARTESIA keys
# The Dockerfile is Frank's — build & deploy to Cloud Run / Fly / Railway.
```
Point `AGENT_WS_URL` (edge secret) at the deployed agent's `wss://.../ws`.
`DATABASE_URL` = your Supabase **session pooler** string (see agent/.env.example).

## What changed vs. gig-grab (and what didn't)

| File | Change |
|---|---|
| `agent/src/gigrab/agent.py` | **unchanged** — the whole Pipecat pipeline is verbatim |
| `agent/src/gigrab/db.py` | rewritten to write `fc_*` tables; speaker `ai`→`sarah` |
| `agent/src/prompts/candidate_interview.py` | Frank's guardrails verbatim; 6 cleaning questions instead of 11 generic; FineClean wrap-up |
| `functions/fc-request-screening` | `SARAH_API_URL` stub → real Twilio outbound call |
| `functions/fc-twilio-voice` | new — TwiML bridge (port of `twilioVoice`) |
| `functions/fc-twilio-status` | new — call/recording webhook (port of `twilioStatus`) |
| `functions/fc-sarah-extract` | new — Claude extraction (port of `extractProfile`) |

## The questions Sarah asks (cleaning screen)
Name & English level · cleaning experience + years · right to work · location &
transport (own transport / driving licence) · availability (start, weekends,
hours, notice) · expected hourly pay. These map 1:1 to the
`fc_candidate_structured_responses` columns.
