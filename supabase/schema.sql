-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Projects Table
create table public.projects (
  id uuid not null default gen_random_uuid(),
  title text not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint projects_pkey primary key (id)
);

-- Tasks Table
create table public.tasks (
  id uuid not null default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  wbs_code text,
  title text not null,
  status text default 'not-started',
  assignee text,
  start_date date,
  due_date date,
  completed_date date,
  dependencies text[] default array[]::text[],
  parent_id uuid references public.tasks(id),
  is_phase boolean default false,
  latest_position text,
  created_at timestamp with time zone not null default now(),
  constraint tasks_pkey primary key (id)
);

-- Messages Table
create table public.messages (
  id uuid not null default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null, -- 'user' or 'assistant'
  content text not null,
  created_at timestamp with time zone not null default now(),
  constraint messages_pkey primary key (id)
);

-- Enable Realtime
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.messages;

-- RLS (Row Level Security) - Open for this prototype (no auth)
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.messages enable row level security;

create policy "Allow all access to projects" on public.projects
  for all using (true) with check (true);
  
create policy "Allow all access to tasks" on public.tasks
  for all using (true) with check (true);
  
create policy "Allow all access to messages" on public.messages
  for all using (true) with check (true);


