-- ============================================================
-- SapJuice Admin Panel - Run this in Supabase SQL Editor
-- ============================================================
-- 1. Create admin_users table (add your admin user after creating them in Auth)
-- 2. Add RLS policies so admins can read/update all orders

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can read admin_users"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- Helper: returns true if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$ language sql security definer;

-- Admins can SELECT all orders (for order list)
create policy "Admins can read all orders"
  on public.orders for select
  using (public.is_admin());

-- Admins can UPDATE orders (for status changes)
create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin());

-- Admins can read order_items for any order
create policy "Admins can read all order items"
  on public.order_items for select
  using (public.is_admin());

-- Admins need to read profiles (for order list customer info)
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ============================================================
-- TO ADD AN ADMIN: 
-- 1. Supabase Dashboard → Authentication → Users → Add user (email + password)
-- 2. Copy the new user's UUID
-- 3. Run: insert into public.admin_users (user_id) values ('<uuid>');
-- ============================================================
