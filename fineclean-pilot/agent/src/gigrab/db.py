"""Async Postgres writer — adapted for the FineClean Supabase schema.

Same shape as gig-grab's original db.py, but every query targets the
`fc_*` tables (see fineclean-pilot/migrations/*.sql) instead of gig-grab's
`sessions` / `transcript_turns` / `profile_cards`.

Connection: point DATABASE_URL at your Supabase Postgres (session pooler),
e.g.  postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
asyncpg connects to it directly — no Cloud SQL unix-socket path here.

Mapping vs. Frank's original:
  transcript_turns              -> fc_transcript_messages
  sessions.status               -> fc_screening_sessions.status
  speaker 'ai'                  -> 'sarah'   (fc_transcript_messages CHECK)
  ord / ms_offset               -> sequence_number / occurred_at
  candidate job-matching        -> disabled (returns []) — screening only
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Optional

import asyncpg


_pool: Optional[asyncpg.Pool] = None

# session_id -> candidate_id cache. fc_transcript_messages requires
# candidate_id on every row, but agent.py only hands db.py the session_id,
# so we resolve + memoise it once per session to keep agent.py untouched.
_candidate_cache: dict[str, str] = {}


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is not None:
        return _pool
    url = os.environ["DATABASE_URL"]
    # Supabase pooler needs statement_cache_size=0 (pgbouncer transaction mode
    # doesn't support prepared statements).
    _pool = await asyncpg.create_pool(
        url, min_size=1, max_size=4, statement_cache_size=0
    )
    return _pool


async def _candidate_for_session(session_id: str) -> Optional[str]:
    cid = _candidate_cache.get(session_id)
    if cid:
        return cid
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT candidate_id FROM fc_screening_sessions WHERE id = $1",
            session_id,
        )
    if row and row["candidate_id"]:
        cid = str(row["candidate_id"])
        _candidate_cache[session_id] = cid
        return cid
    return None


async def write_transcript_turn(
    *,
    session_id: str,
    ord_: int,
    speaker: str,  # "candidate" | "ai"
    text: str,
    ms_offset: int,
) -> None:
    """Append one turn to fc_transcript_messages.

    Frank's agent emits speaker='ai' for Sarah; the fc_ schema's CHECK
    constraint expects 'sarah', so we translate here. ms_offset is Frank's
    per-call millisecond offset — we don't have that column, so occurred_at
    is stamped at write time (ordering is preserved by sequence_number).
    """
    candidate_id = await _candidate_for_session(session_id)
    if not candidate_id:
        return  # unknown session — drop silently (matches Frank's tolerance)

    db_speaker = "sarah" if speaker == "ai" else "candidate"
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO fc_transcript_messages
                (session_id, candidate_id, speaker, message, occurred_at, sequence_number)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (session_id, sequence_number) DO NOTHING
            """,
            session_id,
            candidate_id,
            db_speaker,
            text,
            datetime.now(timezone.utc),
            ord_,
        )


async def update_session_status(
    *,
    session_id: str,
    status: str,
    ended: bool = False,
) -> None:
    """Update fc_screening_sessions lifecycle timestamps.

    status values from agent.py are 'in_progress' (call answered / pipeline
    up) and a terminal status on hangup. fc_screening_sessions.status CHECK
    allows: scheduled | in_progress | completed | failed | no_show.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        if ended:
            await conn.execute(
                """
                UPDATE fc_screening_sessions
                SET status = $2,
                    completed_at = now(),
                    duration_seconds = GREATEST(
                        0,
                        EXTRACT(EPOCH FROM (now() - COALESCE(started_at, now())))::int
                    )
                WHERE id = $1
                """,
                session_id,
                status,
            )
        else:
            # First non-terminal update = call answered. Stamp started_at once.
            await conn.execute(
                """
                UPDATE fc_screening_sessions
                SET status = $2,
                    started_at = COALESCE(started_at, now())
                WHERE id = $1
                """,
                session_id,
                status,
            )


async def fetch_session(session_id: str) -> Optional[dict]:
    """Return enough of the session for main.py to accept the WS connect.

    fc_ has no per-session language column, so we default to English; the
    edge function passes the real language via the <Parameter> anyway.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT s.id, s.candidate_id, s.status
            FROM fc_screening_sessions s
            WHERE s.id = $1
            """,
            session_id,
        )
        if not row:
            return None
        d = dict(row)
        d["kind"] = "candidate_intake"
        d["language"] = "en"
        d["employer_id"] = None
        return d


async def fetch_profile_for_session(session_id: str) -> Optional[dict]:
    """No returning-caller profile in the FineClean flow — always None.

    (Frank uses this to greet repeat callers with their saved CV; the
    screening flow calls each candidate once, so there's nothing to load.)
    """
    return None


async def fetch_preferred_name_for_session(session_id: str) -> Optional[str]:
    """Greet the candidate by the first name we imported for them."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT c.first_name AS n
            FROM fc_screening_sessions s
            JOIN fc_candidates c ON c.id = s.candidate_id
            WHERE s.id = $1
            """,
            session_id,
        )
    if row and isinstance(row["n"], str) and row["n"].strip():
        return row["n"].strip()
    return None


async def store_match_signals(*, candidate_id: str, signals: dict) -> None:
    """No-op in the FineClean flow.

    Frank writes intake signals onto the candidate row live; here the
    structured extraction is a separate post-call step (fc-sarah-extract
    edge function reads fc_transcript_messages with Claude), so the agent
    doesn't persist signals itself.
    """
    return None


async def fetch_top_matches_by_text(query_text: str, k: int = 3) -> list[dict]:
    """Disabled for screening — Sarah doesn't pitch jobs on a screen call.

    Returning [] makes agent.py's mid-call job-match injection a no-op
    without touching agent.py.
    """
    return []
