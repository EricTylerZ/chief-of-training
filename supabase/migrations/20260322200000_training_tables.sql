-- Training tables for Chief of Training quest system.
-- Multi-tenant: each Community Shield site owner can have their own quests.

create table training_quests (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  icon text not null default '🎓',
  tier text not null default 'beginner' check (tier in ('beginner', 'intermediate', 'advanced')),
  category text not null default 'general',
  merit_reward integer not null default 110 check (merit_reward >= 0),
  steps_count integer not null default 0,
  estimated_minutes integer not null default 5,
  created_by text references merit_persons(slug),
  -- Multi-tenant: scoped to a Community Shield site (null = ecosystem-wide)
  site_slug text,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_quests_active on training_quests (active, site_slug) where active = true;
create index idx_quests_site on training_quests (site_slug) where site_slug is not null;

create table training_steps (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references training_quests(id) on delete cascade,
  order_index integer not null default 0,
  step_type text not null check (step_type in ('lesson', 'quiz', 'choice', 'checkpoint')),
  title text not null,
  content jsonb not null default '{}',
  next_step_id uuid references training_steps(id),
  branches jsonb, -- [{condition, next_step_id}]
  merit_points integer not null default 0 check (merit_points >= 0),
  created_at timestamptz not null default now()
);

create index idx_steps_quest on training_steps (quest_id, order_index);

create table training_progress (
  id uuid primary key default gen_random_uuid(),
  person_slug text not null references merit_persons(slug),
  quest_id uuid not null references training_quests(id),
  current_step_id uuid references training_steps(id),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  answers jsonb not null default '{}',
  merit_awarded integer not null default 0,
  unique (person_slug, quest_id)
);

create index idx_progress_person on training_progress (person_slug, status);

create table training_step_completions (
  id uuid primary key default gen_random_uuid(),
  person_slug text not null references merit_persons(slug),
  step_id uuid not null references training_steps(id),
  quest_id uuid not null references training_quests(id),
  response jsonb,
  correct boolean,
  completed_at timestamptz not null default now()
);

create index idx_step_completions on training_step_completions (person_slug, quest_id);

-- RLS
alter table training_quests enable row level security;
alter table training_steps enable row level security;
alter table training_progress enable row level security;
alter table training_step_completions enable row level security;

-- Anyone can read active quests
create policy "Anyone can view active quests" on training_quests
  for select using (active = true);

-- Service role full access
create policy "Service role full access quests" on training_quests
  for all using (auth.role() = 'service_role');

create policy "Service role full access steps" on training_steps
  for all using (auth.role() = 'service_role');

-- Authenticated users can read steps for active quests
create policy "Read steps for active quests" on training_steps
  for select using (
    exists (select 1 from training_quests where id = quest_id and active = true)
  );

-- Users can read/write their own progress
create policy "Users manage own progress" on training_progress
  for all using (
    auth.role() = 'service_role'
    or person_slug = (select person_slug from profiles where id = auth.uid())
  );

create policy "Users manage own step completions" on training_step_completions
  for all using (
    auth.role() = 'service_role'
    or person_slug = (select person_slug from profiles where id = auth.uid())
  );

-- Seed: first quest — "What is EZ Merit?"
insert into training_quests (slug, title, description, icon, tier, category, merit_reward, steps_count, estimated_minutes, created_by, active) values
  ('what-is-ez-merit', 'What is EZ Merit?', 'Learn what EZ Merit Points are, how they work, and where to earn them. The meta-quest: learn about the system by using the system.', '🎖️', 'beginner', 'ecosystem', 110, 5, 3, 'eric-zosso', true);

-- Steps for "What is EZ Merit?"
do $$
declare
  quest_id uuid;
  step1_id uuid := gen_random_uuid();
  step2_id uuid := gen_random_uuid();
  step3_id uuid := gen_random_uuid();
  step3b_id uuid := gen_random_uuid();
  step4_id uuid := gen_random_uuid();
  step5_id uuid := gen_random_uuid();
begin
  select id into quest_id from training_quests where slug = 'what-is-ez-merit';

  insert into training_steps (id, quest_id, order_index, step_type, title, content, next_step_id, merit_points) values
  (step1_id, quest_id, 0, 'lesson', 'Welcome to EZ Merit',
   '{"markdown": "EZ Merit Points are a fun way to track activity across Eric Zosso''s ecosystem of projects. You earn points for doing things -- getting a website built, playing a game, completing a quest like this one, or just saying good morning.\n\nThe points are not redeemable for anything. They are just for fun. A way to see who is most active and have a good time being part of the community."}'::jsonb,
   step2_id, 0),

  (step2_id, quest_id, 1, 'quiz', 'Quick Check',
   '{"question": "What can you redeem EZ Merit Points for?", "options": [{"label": "Nothing. They are just for fun.", "value": "nothing", "correct": true}, {"label": "Gift cards", "value": "gift-cards"}, {"label": "Cash", "value": "cash"}]}'::jsonb,
   step3_id, 22),

  (step3_id, quest_id, 2, 'lesson', 'Where You Earn Points',
   '{"markdown": "You earn points across the ecosystem:\n\n- Community Shield: Get a website built for your business\n- Good Riddance: Trade silver with other members\n- Chief of Training: Complete quests like this one\n- Bounty Board: Complete bounties posted by the AI\n- Daily check-in: Just say good morning for 22 points\n\nYour EZ Merit ID works everywhere. Log in once and you are logged in across all the sites."}'::jsonb,
   step4_id, 0),

  (step3b_id, quest_id, 2, 'lesson', 'Actually, No',
   '{"markdown": "Nice try! EZ Merit Points cannot be redeemed for anything. They are purely for fun, like keeping score in a game where the score does not matter.\n\nLet''s talk about where you earn them."}'::jsonb,
   step4_id, 0),

  (step4_id, quest_id, 3, 'choice', 'What Interests You?',
   '{"choices": []}'::jsonb,
   step5_id, 0),

  (step5_id, quest_id, 4, 'checkpoint', 'You Made It',
   '{"markdown": "You just completed your first quest. 110 EZ Merit Points are headed your way.\n\nExplore more quests on the quest board, check the leaderboard to see where you stand, or visit ezmerit.ericzosso.com to see your full profile."}'::jsonb,
   null, 11);

  -- Set choice options with resolved UUIDs
  update training_steps set content = jsonb_build_object(
    'choices', jsonb_build_array(
      jsonb_build_object('label', 'I want a website for my business', 'description', 'Learn how Community Shield builds sites for local businesses.', 'next_step_id', step5_id),
      jsonb_build_object('label', 'I just want to have fun', 'description', 'Check out the bounty board and see what the AI thinks needs doing.', 'next_step_id', step5_id)
    )
  ) where id = step4_id;

  -- Set branching for the quiz step: wrong answers go to step3b
  update training_steps set branches = jsonb_build_array(
    jsonb_build_object('condition', 'incorrect', 'next_step_id', step3b_id)
  ) where id = step2_id;

  -- Update steps count
  update training_quests set steps_count = 5 where id = quest_id;
end $$;
