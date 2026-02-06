-- =============================================
-- SRIT Digital Notice Board - Database Schema
-- =============================================

-- 1. Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'student' check (role in ('admin', 'student')),
  department text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone can read profiles (needed for admin to count students, etc.)
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- Users can insert their own profile
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Users can update their own profile
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 2. Notices table
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  department text not null default 'ALL',
  category text not null default 'notice' check (category in ('notice', 'holiday', 'attendance', 'academic', 'event')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notices enable row level security;

-- Everyone (even unauthenticated) can read notices
create policy "notices_select_all" on public.notices
  for select using (true);

-- Only the creator (admin) can insert notices
create policy "notices_insert_own" on public.notices
  for insert with check (auth.uid() = created_by);

-- Only the creator can update their notices
create policy "notices_update_own" on public.notices
  for update using (auth.uid() = created_by);

-- Only the creator can delete their notices
create policy "notices_delete_own" on public.notices
  for delete using (auth.uid() = created_by);

-- 3. Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, department)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    nullif(new.raw_user_meta_data ->> 'department', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 4. Index for faster queries
create index if not exists idx_notices_department on public.notices(department);
create index if not exists idx_notices_category on public.notices(category);
create index if not exists idx_notices_created_at on public.notices(created_at desc);
create index if not exists idx_profiles_role on public.profiles(role);
