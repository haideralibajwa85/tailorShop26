# Supabase Configuration & Schema

**Status:** Active
**Database:** PostgreSQL (via Supabase)

## 1. Tables

### `public.users`
Extends the default `auth.users` to store application-specific profile data.
- `id` (UUID, PK): References `auth.users.id`
- `email` (Text)
- `full_name` (Text)
- `role` (Text): 'admin', 'tailor', 'customer'
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `public.orders`
Stores all order details.
- `id` (UUID, PK)
- `customer_id` (UUID): References `public.users.id`
- `order_id` (Text): Human-readable ID (e.g., TS-1234)
- **Core Details:**
  - `category` (Text)
  - `clothing_type` (Text)
  - `gender` (Text)
  - `quantity` (Int)
  - `status` (Text): 'pending', 'inStitching', 'completed', 'delivered'
- **Design & Fabric:**
  - `fabric_type` (Text)
  - `color` (Text)
  - `stitching_style` (Text)
  - `design_reference_url` (Text)
  - `custom_notes` (Text)
- **Financials:**
  - `total_amount` (Decimal)
  - `discount_amount` (Decimal)
  - `final_amount` (Decimal)
  - `payment_status` (Text)
- **Dates:**
  - `order_date` (Date)
  - `expected_completion_date` (Date)
  - `actual_completion_date` (Date)
  - `pickup_date` (Date)

## 2. Row Level Security (RLS) policies

- **Orders Table:**
  - `Users can create own orders`: Allows authenticated users to insert rows where `customer_id` matches their UID (or if they are an admin).

## 3. Important SQL Scripts
Located in `docs/`:

- **`setup_data.sql`**:
  - Updates user roles (Admin/Tailor).
  - Inserts dummy orders for testing.
  - **Usage:** Run after manually registering users via the UI.

- **`manage_roles.sql`**:
  - robust script to toggle a single user's role between Admin/Tailor/Customer for testing purposes.

- **`fix_database_schema.sql`**:
  - Adds missing columns to the `orders` table (migration script).
  - Ensures all necessary fields for the "New Order" form exist.
