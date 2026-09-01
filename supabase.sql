-- Run this whole file in Supabase SQL Editor.
-- This creates posts, one-star-per-user records, and a secure toggle function.

create table if not exists public.posts (
  id text primary key default substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  profile_id text,
  display_name text not null default '',
  username text not null default '',
  content text not null default '',
  image_url text,
  stars integer not null default 0 check (stars >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.post_stars (
  post_id text not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.posts enable row level security;
alter table public.post_stars enable row level security;

-- Public can read posts.
create policy "Anyone can read posts"
on public.posts for select
to anon, authenticated
using (true);

-- Only authenticated admins can insert/update/delete.
-- After creating your admin account, replace YOUR-ADMIN-USER-UUID below
-- with its auth.users id, then run these three policies.

create policy "Admin can insert posts"
on public.posts for insert
to authenticated
with check (auth.uid() = 'YOUR-ADMIN-USER-UUID'::uuid);

create policy "Admin can update posts"
on public.posts for update
to authenticated
using (auth.uid() = 'YOUR-ADMIN-USER-UUID'::uuid)
with check (auth.uid() = 'YOUR-ADMIN-USER-UUID'::uuid);

create policy "Admin can delete posts"
on public.posts for delete
to authenticated
using (auth.uid() = 'YOUR-ADMIN-USER-UUID'::uuid);

-- Users can see only their own star records.
create policy "Users can read their own stars"
on public.post_stars for select
to authenticated
using (auth.uid() = user_id);

-- Star/unstar is performed through the RPC below, so clients do not
-- receive direct insert/delete permission.

create or replace function public.toggle_post_star(target_post_id text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  is_starred boolean;
  new_count integer;
begin
  if current_user_id is null then
    raise exception 'You must be signed in';
  end if;

  select exists(
    select 1 from public.post_stars
    where post_id = target_post_id and user_id = current_user_id
  ) into is_starred;

  if is_starred then
    delete from public.post_stars
    where post_id = target_post_id and user_id = current_user_id;

    update public.posts
    set stars = greatest(stars - 1, 0)
    where id = target_post_id;
  else
    insert into public.post_stars(post_id, user_id)
    values (target_post_id, current_user_id);

    update public.posts
    set stars = stars + 1
    where id = target_post_id;
  end if;

  select stars into new_count from public.posts where id = target_post_id;

  return json_build_object(
    'starred', not is_starred,
    'star_count', coalesce(new_count, 0)
  );
end;
$$;

revoke all on function public.toggle_post_star(text) from public;
grant execute on function public.toggle_post_star(text) to authenticated;

-- Enable anonymous sign-in in Supabase Dashboard:
-- Authentication -> Providers -> Anonymous Sign-Ins -> Enable.
--
-- Then create your admin email/password account in Authentication -> Users.
-- Copy that user's UUID into the three admin policies above.
