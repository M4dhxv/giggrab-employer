-- ============================================================
-- FineClean Pilot — Complete Schema
-- Project: hwheqzshcrimhfmfbvca
-- Run in: Supabase SQL Editor (or via supabase db push)
-- Tables prefixed fc_ to avoid conflicts with existing tables
-- ============================================================

-- ─── EMPLOYERS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_employers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO fc_employers (name, slug)
VALUES ('FineClean', 'fineclean')
ON CONFLICT (slug) DO NOTHING;

-- ─── JOBS ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES fc_employers(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  location    TEXT,
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'paused', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_jobs_employer ON fc_jobs(employer_id);

INSERT INTO fc_jobs (employer_id, title, location)
SELECT id, 'Cleaner / Housekeeper', 'London & surrounding areas'
FROM fc_employers WHERE slug = 'fineclean'
ON CONFLICT DO NOTHING;

-- ─── CANDIDATES ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_candidates (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id                 UUID NOT NULL REFERENCES fc_employers(id) ON DELETE CASCADE,
  job_id                      UUID REFERENCES fc_jobs(id) ON DELETE SET NULL,
  first_name                  TEXT NOT NULL,
  last_name                   TEXT NOT NULL,
  email                       TEXT NOT NULL,
  phone                       TEXT,
  phone_type                  TEXT,
  city                        TEXT,
  postcode                    TEXT,
  source                      TEXT,
  notes                       TEXT,
  invitation_token            UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  invitation_token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  current_status              TEXT NOT NULL DEFAULT 'imported',
  is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_candidates_employer ON fc_candidates(employer_id);
CREATE INDEX IF NOT EXISTS idx_fc_candidates_job      ON fc_candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_fc_candidates_email    ON fc_candidates(email);
CREATE INDEX IF NOT EXISTS idx_fc_candidates_token    ON fc_candidates(invitation_token);
CREATE INDEX IF NOT EXISTS idx_fc_candidates_status   ON fc_candidates(current_status);
CREATE INDEX IF NOT EXISTS idx_fc_candidates_active   ON fc_candidates(is_active);

CREATE OR REPLACE FUNCTION fc_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS fc_candidates_set_updated_at ON fc_candidates;
CREATE TRIGGER fc_candidates_set_updated_at
  BEFORE UPDATE ON fc_candidates
  FOR EACH ROW EXECUTE FUNCTION fc_set_updated_at();

-- ─── CANDIDATE EVENTS (append-only audit log) ────────────────────────────────
-- Events:
--   Application Imported | Invitation Sent | Invitation Opened | Invitation Clicked
--   Form Started | Form Submitted | Candidate Not Looking
--   Screening Invitation Sent | OTP Requested | OTP Verified
--   Sarah Call Requested | Sarah Call Started | Sarah Call Completed
--   Recruiter Review | Interview Invited | Interview Booked | Offer Sent | Rejected

CREATE TABLE IF NOT EXISTS fc_candidate_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES fc_candidates(id) ON DELETE CASCADE,
  event_name   TEXT NOT NULL,
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata     JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_fc_events_candidate ON fc_candidate_events(candidate_id);
CREATE INDEX IF NOT EXISTS idx_fc_events_name      ON fc_candidate_events(event_name);
CREATE INDEX IF NOT EXISTS idx_fc_events_occurred  ON fc_candidate_events(occurred_at DESC);

-- ─── PRE-QUALIFICATION RESPONSES ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_prequal_responses (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id            UUID NOT NULL REFERENCES fc_candidates(id) ON DELETE CASCADE,
  question                TEXT NOT NULL,
  answer                  TEXT NOT NULL,
  submitted_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completion_time_seconds INTEGER
);

CREATE INDEX IF NOT EXISTS idx_fc_prequal_candidate ON fc_prequal_responses(candidate_id);

-- ─── PHONE VERIFICATIONS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_phone_verifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id     UUID NOT NULL UNIQUE REFERENCES fc_candidates(id) ON DELETE CASCADE,
  phone            TEXT NOT NULL,
  otp_hash         TEXT,
  otp_salt         TEXT,
  attempts         INTEGER NOT NULL DEFAULT 0,
  verified         BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at      TIMESTAMPTZ,
  last_otp_sent_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_phone_candidate ON fc_phone_verifications(candidate_id);

-- ─── SCREENING SESSIONS ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_screening_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id     UUID NOT NULL REFERENCES fc_candidates(id) ON DELETE CASCADE,
  call_id          TEXT,
  scheduled_at     TIMESTAMPTZ,
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  duration_seconds INTEGER,
  status           TEXT NOT NULL DEFAULT 'scheduled'
                   CHECK (status IN ('scheduled','in_progress','completed','failed','no_show')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_sessions_candidate ON fc_screening_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_fc_sessions_status    ON fc_screening_sessions(status);

-- ─── TRANSCRIPT MESSAGES (individually queryable) ────────────────────────────

CREATE TABLE IF NOT EXISTS fc_transcript_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES fc_screening_sessions(id) ON DELETE CASCADE,
  candidate_id    UUID NOT NULL REFERENCES fc_candidates(id) ON DELETE CASCADE,
  speaker         TEXT NOT NULL CHECK (speaker IN ('sarah', 'candidate')),
  message         TEXT NOT NULL,
  occurred_at     TIMESTAMPTZ NOT NULL,
  sequence_number INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_transcript_session   ON fc_transcript_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_fc_transcript_candidate ON fc_transcript_messages(candidate_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fc_transcript_seq
  ON fc_transcript_messages(session_id, sequence_number);

-- ─── STRUCTURED CANDIDATE RESPONSES ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_candidate_structured_responses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           UUID NOT NULL UNIQUE REFERENCES fc_screening_sessions(id) ON DELETE CASCADE,
  candidate_id         UUID NOT NULL REFERENCES fc_candidates(id) ON DELETE CASCADE,
  years_experience     INTEGER,
  cleaning_experience  TEXT,
  right_to_work        BOOLEAN,
  earliest_start_date  DATE,
  weekend_availability BOOLEAN,
  preferred_hours      TEXT,
  preferred_locations  TEXT[],
  own_transport        BOOLEAN,
  driving_licence      BOOLEAN,
  english_level        TEXT CHECK (english_level IN ('basic','conversational','fluent','native')),
  expected_pay_hourly  NUMERIC(6,2),
  notice_period        TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_structured_candidate ON fc_candidate_structured_responses(candidate_id);

-- ─── AI SUMMARIES ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_ai_summaries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID NOT NULL UNIQUE REFERENCES fc_screening_sessions(id) ON DELETE CASCADE,
  candidate_id        UUID NOT NULL REFERENCES fc_candidates(id) ON DELETE CASCADE,
  summary             TEXT,
  strengths           TEXT[],
  concerns            TEXT[],
  missing_information TEXT[],
  recommendation      TEXT CHECK (recommendation IN ('shortlist','interview','reject','hold')),
  confidence_score    NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_ai_candidate ON fc_ai_summaries(candidate_id);
CREATE INDEX IF NOT EXISTS idx_fc_ai_recommendation ON fc_ai_summaries(recommendation);

-- ─── RECRUITER DECISIONS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_recruiter_decisions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id      UUID NOT NULL REFERENCES fc_candidates(id) ON DELETE CASCADE,
  session_id        UUID REFERENCES fc_screening_sessions(id) ON DELETE SET NULL,
  recruiter_id      TEXT,
  decision          TEXT NOT NULL
                    CHECK (decision IN ('shortlisted','interview_invited','offer_sent','rejected','hold')),
  notes             TEXT,
  shortlisted       BOOLEAN NOT NULL DEFAULT FALSE,
  interview_invited BOOLEAN NOT NULL DEFAULT FALSE,
  offer_sent        BOOLEAN NOT NULL DEFAULT FALSE,
  rejected          BOOLEAN NOT NULL DEFAULT FALSE,
  decided_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_recruiter_candidate ON fc_recruiter_decisions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_fc_recruiter_decision  ON fc_recruiter_decisions(decision);

-- ─── EMAIL TRACKING ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_email_tracking (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES fc_candidates(id) ON DELETE CASCADE,
  template     TEXT NOT NULL,
  subject      TEXT NOT NULL,
  resend_id    TEXT,
  sent_at      TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at    TIMESTAMPTZ,
  clicked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_email_candidate ON fc_email_tracking(candidate_id);
CREATE INDEX IF NOT EXISTS idx_fc_email_template  ON fc_email_tracking(template);
CREATE INDEX IF NOT EXISTS idx_fc_email_resend    ON fc_email_tracking(resend_id);

-- ─── FINE-TUNING DATASET ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fc_fine_tuning_dataset (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id         UUID NOT NULL REFERENCES fc_candidates(id) ON DELETE CASCADE,
  session_id           UUID NOT NULL UNIQUE REFERENCES fc_screening_sessions(id) ON DELETE CASCADE,
  industry             TEXT NOT NULL DEFAULT 'cleaning',
  role                 TEXT,
  transcript           JSONB,
  structured_responses JSONB,
  ai_summary           JSONB,
  ai_recommendation    TEXT,
  confidence_score     NUMERIC(3,2),
  recruiter_decision   TEXT,
  final_hiring_outcome TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_finetune_candidate ON fc_fine_tuning_dataset(candidate_id);
CREATE INDEX IF NOT EXISTS idx_fc_finetune_outcome   ON fc_fine_tuning_dataset(final_hiring_outcome);
CREATE INDEX IF NOT EXISTS idx_fc_finetune_role      ON fc_fine_tuning_dataset(role);

-- ─── RLS (all locked; edge functions use service_role and bypass RLS) ─────────

ALTER TABLE fc_employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_candidate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_prequal_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_screening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_transcript_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_candidate_structured_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_recruiter_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_fine_tuning_dataset ENABLE ROW LEVEL SECURITY;
