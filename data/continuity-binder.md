# Chief of Training -- Continuity Binder

**Version:** 1.0
**Last updated:** 2026-03-22
**Status:** Initial scaffold

## Current State
- Angular v21 app scaffolded with CLI
- Project structure created (services, components, interceptors, guards, API)
- CLAUDE.md written
- No components built yet
- No Supabase tables created yet
- Not deployed yet

## What Needs to Happen Next
1. Wire up EZ Merit SSO (auth interceptor + cookie handling)
2. Create Supabase training tables
3. Build the quest player component (core UX)
4. Build quest board (browse quests)
5. Seed first quests
6. Deploy to Vercel at chiefoftraining.ericzosso.com

## Key Decisions Made
- Quest chains with branching (not flat courses)
- Own API layer connecting to shared Supabase (not calling Community Shield APIs)
- Financial-grade Angular patterns from the dashboard work
- Point values use 11, 22, 33, 44, 55 multiples (not 42)

## Cross-Project Dependencies
- Community Shield: ecosystem registry needs Chief of Training entry
- EZ Merit: "Where You Earn Points" needs Chief of Training link
- Sentinel-Ops: training quests can be bounties
- Auto-Agent: needs AGENT_WORKFLOW.md to interact with this project
