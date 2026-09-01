-- IMPORTANT: run this in Supabase SQL Editor.
-- If you already ran the older version, keep your existing tables/function.
-- The policies below use your admin user's UUID.

create table if not exists public.posts (
 id text primary key default substr(md5(random()::text || clock_timestamp()::text),1,12),
 profile_id text, display_name text not null default '', username text not null default '',
 content text not null default '', image_url text, stars integer not null default 0 check(stars>=0),
 created_at timestamptz not null default now()
);
create table if not exists public.post_stars (
 post_id text not null references public.posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(post_id,user_id)
);
alter table public.posts enable row level security;
alter table public.post_stars enable row level security;

drop policy if exists "Anyone can read posts" on public.posts;
create policy "Anyone can read posts" on public.posts for select to anon,authenticated using(true);

-- Replace YOUR-ADMIN-USER-UUID before running these.
drop policy if exists "Admin can insert posts" on public.posts;
create policy "Admin can insert posts" on public.posts for insert to authenticated
with check(auth.uid()='YOUR-ADMIN-USER-UUID'::uuid);
drop policy if exists "Admin can update posts" on public.posts;
create policy "Admin can update posts" on public.posts for update to authenticated
using(auth.uid()='YOUR-ADMIN-USER-UUID'::uuid) with check(auth.uid()='YOUR-ADMIN-USER-UUID'::uuid);
drop policy if exists "Admin can delete posts" on public.posts;
create policy "Admin can delete posts" on public.posts for delete to authenticated
using(auth.uid()='YOUR-ADMIN-USER-UUID'::uuid);

drop policy if exists "Users can read their own stars" on public.post_stars;
create policy "Users can read their own stars" on public.post_stars for select to authenticated
using(auth.uid()=user_id);

create or replace function public.toggle_post_star(target_post_id text)
returns json language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); was_starred boolean; new_count integer;
begin
 if uid is null then raise exception 'You must be signed in'; end if;
 select exists(select 1 from public.post_stars where post_id=target_post_id and user_id=uid) into was_starred;
 if was_starred then
   delete from public.post_stars where post_id=target_post_id and user_id=uid;
   update public.posts set stars=greatest(stars-1,0) where id=target_post_id;
 else
   insert into public.post_stars(post_id,user_id) values(target_post_id,uid);
   update public.posts set stars=stars+1 where id=target_post_id;
 end if;
 select stars into new_count from public.posts where id=target_post_id;
 return json_build_object('starred',not was_starred,'star_count',coalesce(new_count,0));
end; $$;
revoke all on function public.toggle_post_star(text) from public;
grant execute on function public.toggle_post_star(text) to authenticated;

-- In Supabase Dashboard:
-- Authentication > Providers > Anonymous Sign-Ins: ON
-- Authentication > Users: create your admin email/password account.
-- Copy its UUID and replace YOUR-ADMIN-USER-UUID above.
-- Authentication > Providers: make sure Email provider is enabled too.
