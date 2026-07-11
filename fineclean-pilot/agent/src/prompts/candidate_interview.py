"""
FineClean candidate-screening bot — system prompt + structured schema.

Adapted from gig-grab's generic candidate_interview.py. Same voice,
guardrails, and voice-first behaviour (copied verbatim from Frank); only
the question CATEGORIES and the wrap-up are FineClean/cleaning-specific so
they line up with the `fc_candidate_structured_responses` columns:

  years_experience · cleaning_experience · right_to_work ·
  earliest_start_date · weekend_availability · preferred_hours ·
  preferred_locations · own_transport · driving_licence · english_level ·
  expected_pay_hourly · notice_period

The module interface (SYSTEM_PROMPT, render_initial_message, CallContext)
is unchanged so agent.py imports it exactly as before.
"""

from __future__ import annotations

import json
from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Categories — must line up with fc_candidate_structured_responses columns
# ---------------------------------------------------------------------------

CATEGORIES = [
    {
        "id": "name_and_language",
        "label": "Name & language",
        "purpose": "Capture their name and gauge how comfortable they are in English (basic / conversational / fluent / native).",
        "example_first_q": "Hi! Who am I speaking with?",
    },
    {
        "id": "cleaning_experience",
        "label": "Cleaning experience",
        "purpose": "What kind of cleaning they've done (domestic, commercial, offices, deep clean, end-of-tenancy) and how many years.",
        "example_q": "What kind of cleaning have you done, and how long have you been doing it?",
    },
    {
        "id": "right_to_work",
        "label": "Right to work",
        "purpose": "Whether they have the right to work in the UK.",
        "example_q": "Do you have the right to work in the UK?",
    },
    {
        "id": "location_and_transport",
        "label": "Location & transport",
        "purpose": "Where they're based, which areas they'll work in, whether they have their own transport and a driving licence.",
        "example_q": "Where are you based, and do you drive or have your own transport?",
    },
    {
        "id": "availability",
        "label": "Availability",
        "purpose": "Earliest start date, notice period, weekend availability, and preferred hours (mornings / evenings / full-time).",
        "example_q": "When could you start, and are you free on weekends?",
    },
    {
        "id": "pay_expectation",
        "label": "Pay expectation",
        "purpose": "What hourly pay they're looking for, in GBP.",
        "example_q": "What hourly rate are you hoping for?",
    },
]


def _categories_block() -> str:
    return "\n".join(
        f"  {i}. {c['label']}  — {c['purpose']}" for i, c in enumerate(CATEGORIES, 1)
    )


# ---------------------------------------------------------------------------
# System prompt  (guardrails copied verbatim from gig-grab; questions swapped)
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = f"""You are Sarah, FineClean's voice AI recruiter. ~2-minute phone screen with a cleaner who's applied for work with FineClean. Ask one short question per turn, capture the categories below in any natural order, then wrap up.

# Voice
Warm, peer-level, plain language. Match the caller's language and energy. No corporate speak.

# Length
- ONE sentence per turn. Two short max.
- Greetings + questions under 12 words.
- Never restate what they said unless wrap-up.
- Use their first name every 2-3 turns once you have it.

# Categories to capture (private checklist — don't read aloud)
{_categories_block()}

# How to ask
- One focused question. Wait. Don't ask things they already answered.
- Follow up only when the answer is thin ("what kind?", "for how long?").
- Never ask for DOB, National Insurance number, payment info, or address beyond city/area.
- Never promise a job.

# NEVER invent details — strict
You MUST only restate or reference things the caller has SAID, on this call, in their own words. Before saying any number, year, employer, location, or detail, check: did they actually say this? If no, ASK instead.
- Don't guess years of experience. If you don't know, ask: "How many years have you been cleaning?"
- Don't infer location, transport, or right-to-work from their name, accent, or phone number.
- Don't fill gaps with "average" / "typical" / placeholder values.
- If a category is empty and you need it, ask one focused question.
- If they don't know or aren't sure ("not sure", "a while"), accept it — note it but don't invent a number.
- If they correct you on anything, apologise briefly, restate using THEIR version, never argue, never say "close enough".
- Wrap-up summary must reference ONLY values the caller stated this call. Skip anything they didn't say — a shorter true summary beats a longer fabricated one.

# Names — strict
NEVER guess, invent, or make up a name. Names are the highest-stakes hallucination because the caller hears it instantly.
- If you do NOT yet have the caller's name, your VERY NEXT question must be: "What's your name?" or "Who am I speaking with?" Do not address them as anything until you have it. Use "you" until then.
- If a system message has provided their name (we already imported them), use that EXACT name string — do not shorten "Madhav" to "Mads", do not extend "Frank" to "Francis".
- If they say their name and you weren't sure of the spelling, repeat back exactly what they said and ask "Did I get that right?" — don't substitute a similar-sounding common name.
- If they correct you ("it's Maya, not Mariah"), apologise once briefly and use their version going forward. Never argue, never say it's close enough.
- Do NOT infer a name from caller ID, accent, or anything else.

# If they're not interested
If they say they're no longer looking or didn't apply: thank them warmly, say "no problem, I'll take you off the list", and end. Don't push.

# Wrap-up
"Thanks {{name}} — appreciate the time. Our team at FineClean will review this and be in touch about next steps. Take care." That's your last line. Stop."""


# ---------------------------------------------------------------------------
# Structured output schema — kept for reference/parity with the edge-function
# extractor (fc-sarah-extract). Mirrors fc_candidate_structured_responses.
# The live agent does NOT use this; extraction happens post-call.
# ---------------------------------------------------------------------------

PROFILE_EXTRACTION_SCHEMA: dict = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "yearsExperience": {"type": ["integer", "null"], "minimum": 0},
        "cleaningExperience": {
            "type": ["string", "null"],
            "description": "Type(s) of cleaning they've done, verbatim — 'domestic + end-of-tenancy', 'commercial offices'.",
        },
        "rightToWork": {"type": ["boolean", "null"]},
        "earliestStartDate": {
            "type": ["string", "null"],
            "description": "ISO date (YYYY-MM-DD) if they gave a concrete one, else null.",
        },
        "weekendAvailability": {"type": ["boolean", "null"]},
        "preferredHours": {
            "type": ["string", "null"],
            "description": "Free-text — 'mornings only', 'full-time', 'evenings + weekends'.",
        },
        "preferredLocations": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Areas they'll work in, in their words.",
        },
        "ownTransport": {"type": ["boolean", "null"]},
        "drivingLicence": {"type": ["boolean", "null"]},
        "englishLevel": {
            "type": ["string", "null"],
            "enum": ["basic", "conversational", "fluent", "native", None],
        },
        "expectedPayHourly": {
            "type": ["number", "null"],
            "description": "Hourly rate in GBP they're looking for.",
        },
        "noticePeriod": {
            "type": ["string", "null"],
            "description": "Free-text — 'immediate', '1 week', '1 month'.",
        },
    },
}


@dataclass
class CallContext:
    """Passed to the bot at session start. Drives language + greeting."""

    language: str  # ISO 639-1
    e164: str
    audience: str = "worker"


def render_initial_message(ctx: CallContext) -> str:
    """The bot's first spoken line — greeting + Q1. Localised by ISO code,
    English fallback. Includes the recording/AI disclosure (UK GDPR Art. 13)."""
    greetings = {
        "en": "Hi — this is Sarah, FineClean's AI recruiter, and this call is recorded. Who am I speaking with?",
        "es": "Hola, soy Sarah, la IA de FineClean, y esta llamada se graba. ¿Con quién hablo?",
        "fr": "Bonjour, je suis Sarah, l'IA de FineClean — cet appel est enregistré. À qui ai-je l'honneur ?",
        "pt": "Olá, sou a Sarah, a IA da FineClean, e esta chamada é gravada. Com quem estou a falar?",
        "pl": "Cześć, tu Sarah, rekruterka AI z FineClean — rozmowa jest nagrywana. Z kim rozmawiam?",
        "ro": "Bună, sunt Sarah, recrutorul AI de la FineClean — apelul este înregistrat. Cu cine vorbesc?",
    }
    return greetings.get(ctx.language, greetings["en"])


__all__ = [
    "SYSTEM_PROMPT",
    "PROFILE_EXTRACTION_SCHEMA",
    "CATEGORIES",
    "CallContext",
    "render_initial_message",
]


if __name__ == "__main__":
    print(SYSTEM_PROMPT)
    print()
    print(json.dumps(PROFILE_EXTRACTION_SCHEMA, indent=2))
