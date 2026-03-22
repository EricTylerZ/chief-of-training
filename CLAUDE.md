# Chief of Training

> **Ecosystem role:** Fish. Part of Eric Zosso's ecosystem, powered by EZ Merit Points.

## Mission
Angular v21 training platform where people in the EZ Merit ecosystem learn anything and earn points doing it. Quest-based learning with branching paths, adapted from Eric's Air Force training methodology.

## Background
Eric Zosso was Chief of Training for the 50th Operations Group at Schriever Space Force Base (now a Space Force installation). Before that, a GPS payload instructor teaching officers about atomic clocks and satellite systems. After active duty, an Advanced Staff Instructor in the Air Force Reserves, specifically assigned to teach Space Force personnel about electronic warfare. He knows how to build training programs that work, and this platform makes that methodology available to everyone.

## Stack
- **Angular v21** -- standalone SPA, zoneless change detection, signals
- **Supabase** -- shared instance with Community Shield (EZ Merit identity, points, training data)
- **Vercel** -- deployment at chiefoftraining.ericzosso.com
- **Express/Fastify** -- lightweight API layer (Vercel serverless functions)

## Architecture
- **Standalone Angular app** -- NOT inside Next.js. Own repo, own deployment, own API.
- **Shared Supabase** -- Same database as Community Shield for merit_persons, merit_ledger, merit_milestones. Training-specific tables (training_quests, training_steps, training_progress) also in this Supabase.
- **EZ Merit SSO** -- Cookies scoped to `.ericzosso.com` for cross-subdomain login. Log in at ezmerit.ericzosso.com, authenticated everywhere.
- **Financial-grade Angular** -- HttpClient with interceptors, RouterLink, ActivatedRoute, error signals, subscription cleanup. Built to bank/insurance specs.

## Key Paths
- `src/app/app.routes.ts` -- route config
- `src/services/` -- API, auth, quest, merit, training services
- `src/interceptors/auth.interceptor.ts` -- 401 handling, SSO cookie passthrough
- `src/guards/auth.guard.ts` -- canActivate for protected routes
- `src/components/quest-player/` -- the core learning experience
- `src/components/quest-board/` -- browse available quests
- `api/` -- Express/Fastify serverless API
- `supabase/migrations/` -- training table schemas
- `data/continuity-binder.md` -- session handoff document

## Quest Model
Quests are chains of steps with branching:
- **lesson** -- content to read
- **quiz** -- knowledge check, can branch on correct/incorrect
- **choice** -- narrative branch point, both paths valid
- **checkpoint** -- reflection, no wrong answer

## Merit Points
- 0-11 pts per step, 22 pts for correct quiz answers
- 110-1100 pts for quest completion (by tier)
- Milestones for 1st quest, 5 quests, 10 quests
- 22 pts daily for any training activity

## Compliance Goals
- WCAG AA accessibility on all content
- Color contrast validation (learned from EZ Merit button bug)
- Intimacy gradient: landing for strangers, quests for members
- Hays Code: every quest makes the learner look good, never condescending
- Privacy: merit IDs on leaderboard, not real names

## Commands
- `npx ng serve` -- local dev server
- `npx ng build` -- production build
- `npm run api:dev` -- local API server

## Model Guidance
- **Sonnet/Haiku** for quest content generation, component building
- **Opus** for architecture decisions, complex quest branching logic
