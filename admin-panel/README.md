# SapJuice Admin Panel

Admin dashboard for managing delivery status of orders.

## Setup

### 1. Run the admin migration in Supabase

In your Supabase project → SQL Editor, run the contents of:

```
../supabase/admin-migration.sql
```

### 2. Create an admin user

1. Supabase Dashboard → **Authentication** → **Users** → **Add user**
2. Enter email and password (remember these for login)
3. Copy the new user's **UUID** from the table
4. In SQL Editor, run:

```sql
insert into public.admin_users (user_id) values ('<paste-user-uuid>');
```

### 3. Start the dev server

```bash
cd admin-panel
npm run dev
```

Open the URL shown (e.g. http://localhost:5173).

## Features

- **Login only** – No registration; admins are added via SQL
- **Order list** – View all orders with customer info, items, address
- **Search** – By order ID, customer name, email, or address
- **Filter** – By status (placed, preparing, out_for_delivery, delivered)
- **Sort** – Newest or oldest first
- **Update status** – Mark orders "Out for Delivery" or "Delivered"
