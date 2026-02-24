-- ============================================================
-- SapJuice Supabase Schema
-- Run this in your Supabase SQL Editor after creating a project
-- ============================================================

-- 1. Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text not null,
  points_balance int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 1b. Add saved address to profiles (run if table already exists)
alter table public.profiles add column if not exists saved_address text default null;


-- 2. Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id text not null unique,
  total int not null,
  address text not null,
  notes text default '',
  points_earned int not null default 0,
  points_used int not null default 0,
  status text not null default 'placed'
    check (status in ('placed', 'preparing', 'out_for_delivery', 'delivered')),
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- Auto-update updated_at on status change
create or replace function public.update_order_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_order_updated_at on public.orders;
create trigger set_order_updated_at
  before update on public.orders
  for each row execute function public.update_order_timestamp();


-- 3. Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  juice_id text not null,
  juice_name text not null,
  price int not null
);

alter table public.order_items enable row level security;

create policy "Users can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );


-- 4. Reviews (publicly readable)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  juice_id text not null,
  user_name text not null,
  taste_rating int not null check (taste_rating between 1 and 5),
  quality_rating int not null check (quality_rating between 1 and 5),
  comment text default '',
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Authenticated users can insert reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);


-- 5. Enable realtime on orders (for tracking)
alter publication supabase_realtime add table public.orders;


-- 6. Seed reviews
insert into public.reviews (id, user_id, juice_id, user_name, taste_rating, quality_rating, comment, created_at)
values
  (gen_random_uuid(), null, '1', 'Priya M.', 5, 5, 'Absolutely love the Green Detox! Tastes incredibly fresh and clean.', '2026-02-15T10:30:00Z'),
  (gen_random_uuid(), null, '2', 'Rahul K.', 5, 4, 'Tropical Boost is my daily go-to. Perfect balance of mango and pineapple.', '2026-02-14T14:20:00Z'),
  (gen_random_uuid(), null, '3', 'Ananya S.', 4, 5, 'Berry Bliss is so smooth and the berries taste super fresh!', '2026-02-13T09:15:00Z'),
  (gen_random_uuid(), null, '1', 'Dev P.', 4, 5, 'Great detox option. Feels genuinely cold-pressed, not from concentrate.', '2026-02-12T16:45:00Z'),
  (gen_random_uuid(), null, '4', 'Meera J.', 5, 4, 'The ginger kick in Citrus Spark is amazing. Wakes you right up!', '2026-02-11T08:00:00Z'),
  (gen_random_uuid(), null, '5', 'Arjun T.', 4, 4, 'Carrot Glow has a lovely earthy sweetness. The turmeric is subtle but nice.', '2026-02-10T12:30:00Z'),
  (gen_random_uuid(), null, '6', 'Kavya R.', 5, 5, 'Cool Cucumber is the most refreshing drink I''ve ever had. Perfect for summer.', '2026-02-09T15:10:00Z'),
  (gen_random_uuid(), null, '2', 'Sanjay N.', 4, 5, 'Kids love the Tropical Boost too. Great quality and fast delivery.', '2026-02-08T11:00:00Z');
