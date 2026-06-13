# GigGrab — Employer App

Prototype of the **employer side** of GigGrab. React + Vite + TypeScript SPA. No backend —
everything is mocked in-component to demo the experience.

## What GigGrab is (the proposition every screen must reinforce)

GigGrab is a **voice-first workforce acquisition platform** for frontline/deskless workers
(warehouse, construction, care, hospitality, logistics, cleaning, security).

- **Workers** don't apply. No CVs, no forms, no accounts. They **call a number** and talk to
  **Sarah**, GigGrab's AI hiring agent. Free for workers. 24/7. **32 languages, AI-powered.**
- **Employers** don't post-and-wait. They tell Sarah what they need; she **sources, calls,
  screens, qualifies, interviews and follows up** automatically, then delivers a ranked,
  interview-ready shortlist. Employers **review outcomes**, they don't manage candidates.
- Workers come from a **proprietary pool** — Facebook/Reddit/referrals funnelled into GigGrab
  WhatsApp communities and talent pools that can be reactivated for any new role.

**Positioning, hold this line:** call-first, outcome-first, agentic. NOT a job board, NOT an
ATS, NOT a recruiting CRM. The employer's job is "tell Sarah what you need → Sarah works →
review outcomes." Wording is **"qualified"** workers (never "vetted"), **campaigns** (not "job
posts" in-product), and Sarah is always the actor ("Sarah called 12 candidates").

## Architecture

- Routing: `react-router` in `src/app/App.tsx`. Entry `src/main.tsx` → `src/styles/index.css`.
- One component per page in `src/app/components/`. shadcn/ui primitives live in
  `components/ui/` (largely unused — most pages are hand-rolled). MUI is used on a few flow pages.
- No state management lib, no API layer. Mock data + `useState`/`setInterval` simulate Sarah.

### Employer flow (routes)
`/` LandingPage → `/post-job` CreateJobPage → `/call-giggrab` CallGigGrabPage →
`/market-intel` MarketIntelPage → `/choose-plan` ChoosePlanPage → `/set-budget` SetBudgetPage →
`/dashboard` DashboardPage.

- **CreateJobPage** = the callback request. One screen: phone number + call-language select (32
  langs) → "Sarah is calling you" animation → routes to the live call transcript.
- **MarketIntelPage**: after import, Sarah "analyses" then shows worker availability per role
  (available / actively looking / fill time). CTA "Start matching workers".
- **ChoosePlanPage**: Free / Standard (most popular) / Premium=Enterprise (Contact Sales, no
  budget step). Sarah-minute model: ~5 min per interested worker, 500 min per 100 interested,
  tiers up by 500.
- **SetBudgetPage** ends the flow — ToS checkbox + "Launch Campaign" → dashboard. (There is no
  separate review/launch page; it was removed.)
- **DashboardPage** is the agentic centre — see below.

### Dashboard (the agentic surface)
- Top bar with hamburger → click-to-open left **drawer** nav (no persistent left/right sidebars).
  Drawer primary action: "Post a new job".
- Centre: **matched candidates** list (sorted by score) above a fixed **agent chat bar**.
- **AgentDock** parses typed commands into intents (`buildPlan`):
  - "give me candidates in <area>" → filters/adds local candidates in the **centre** list.
  - call / interview / SMS / reactivate → open the **right ActionPanel** showing Sarah working
    each candidate live (queued → live status → conversation exchange → outcome chips).
- **Import jobs** button → **ImportPanel** (same right pane): paste a careers/job link, Sarah
  pulls roles live one-by-one, user selects, they become campaign chips.
- Completed agent tasks leave result cards + a toast.

## Conventions

- **Emerald** is the brand: `#10b981` (hover `#059669`), tint `#f0fdf4`, border `#a7f3d0`.
  Inter font.
- **Animation**: shared utilities in `src/styles/index.css` — `gg-in` (entrance, 0.3s ease-out),
  `gg-d1..5` (stagger), `gg-lift` (hover). Page-local keyframes live in a `<style>` block or a
  `CSS` template string inside the component (LandingPage, DashboardPage `AGENT_CSS`). Follow
  SaaS motion rules: 150–300ms, ease-out, never bouncy, always honour
  `prefers-reduced-motion`.
- New "live agent" flourishes should reuse the existing pattern: a step list advancing on an
  interval, items revealing with `gg-in`/`ggFadeUp`, a LIVE dot, and a completion summary.

## Working here

- `npm run dev` (port 5173). Verify visual changes in the browser, not just a build.
- `npx vite build` for a fast type/compile check.
- Push target: `https://github.com/M4dhxv/giggrab-employer` (`main`). Commit/push only when asked.
