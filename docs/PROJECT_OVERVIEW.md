# Tailor Shop Management System - Project Overview

## 1. Project Description
A comprehensive web application for managing a tailoring business. It handles multiple organizations (shops), user roles (Superadmin, Admin, Tailor, Customer), order tracking, stitching assignments, and financial management.

## 2. Technology Stack
- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## 3. Database Schema

### Core Tables

#### `users`
Stores all user profiles linked to Supabase Auth.
- `id` (UUID, PK): References auth.users
- `email` (Text): User email
- `phone` (Text): Contact number
- `full_name` (Text): Display name
- `role` (Enum): 'superadmin', 'admin', 'tailor', 'customer'
- `organization_id` (UUID): Links to the shop/organization (Null for Superadmin)
- `language_preference` (Text): 'en', 'ur', 'ar'
- `gender` (Text): 'male', 'female'
- `address` (Text): Physical address
- `is_active` (Boolean): Account status

#### `orders`
Central table for tracking clothing orders.
- `id` (UUID, PK)
- `order_id` (Text): Human-readable ID (e.g., TS-1234)
- `customer_id` (UUID): FK to `users`
- `tailor_id` (UUID): FK to `users` (assigned tailor)
- `organization_id` (UUID): FK to organizations
- `status` (Enum): 'pending', 'in_stitching', 'completed', 'delivered', 'cancelled'
- `category` (Text): e.g., 'Shalwar Kameez'
- `clothing_type` (Text): e.g., 'Simple'
- `total_amount` (Numeric): Total price
- `advance_amount` (Numeric): Paid upfront
- `expected_completion_date` (Date)
- `created_at` (Timestamp)

#### `order_measurements`
Stores specific measurements for an order.
- `id` (UUID, PK)
- `order_id` (UUID): FK to `orders`
- `chest`, `waist`, `hip`, `shoulder`, `neck`, `trouser_length`, `shirt_length`, `sleeve_length` (Text/Numeric)

#### `order_extra_charges`
Tracks additional costs added to an order.
- `id` (UUID, PK)
- `order_id` (UUID): FK to `orders`
- `amount` (Numeric)
- `description` (Text)

#### `categories`
Lookup table for clothing categories.
- `id` (UUID, PK)
- `name` (Text): e.g., 'Shalwar Kameez', 'Thobe'

#### `clothing_types`
Lookup table for specific types within categories.
- `id` (UUID, PK)
- `category_id` (UUID): FK to `categories`
- `name` (Text): e.g., 'Designer', 'Simple'

#### `organizations` (Implied)
- `id` (UUID, PK)
- `name` (Text)
- `subscription_status` (Text)

#### `work_assignments`
Tracks tasks assigned to stitchers.
- `id` (UUID, PK)
- `order_id` (UUID): FK to `orders`
- `stitcher_id` (UUID): FK to `users`
- `status` (Text): 'pending', 'completed'

## 4. Key Features & Workflows

### Authentication
- Role-Based Access Control (RBAC) via Middleware.
- specialized dashboards for each role.
- Secure server-side session handling.

### Workflows
1.  **Order Creation**:
    - Tailor selects a customer (or registers a new one).
    - Selects Category & Clothing Type (Dynamic Dropdowns).
    - Enters measurements and financial details.
    - Assigns to a stitcher (optional).

2.  **Customer Registration**:
    - Tailors can register customers via phone number.
    - System automatically creates a User account and Profile.

3.  **Dashboard**:
    - **Superadmin**: Global view of all organizations and users.
    - **Admin**: Shop-level management.
    - **Tailor**: Order management, measurements view, new order creation.
    - **Tailor**: Order management, measurements view, new order creation.
    - **Customer**: View own orders and status.

4.  **Live Production Tracking**:
    - **Live Work Tracker**: Real-time dashboard view for tailors to see all active orders and their stitcher assignments.
    - **Quick Assignment**: Tailors can assign or reassign stitchers directly from the dashboard.

5.  **Repeat Order / Templates**:
    - **History Lookup**: When a recurring customer is selected, their previous order categories are displayed.
    - **One-Click Prefill**: Tailors can select a previous order to instantly prefill the form with measurements and details (Category, Clothing Type, etc.) from that past order.

## 5. Security Policies (RLS)
Row Level Security is enabled on all tables to ensure data isolation:
- **Superadmins**: Full access.
- **Admins**: Access to their Organization's data.
- **Tailors**: Access to assigned orders and customers within their organization.
- **Customers**: Access only to their own profile and orders.

## 6. Directory Structure
- `src/app`: Next.js App Router pages (grouped by role).
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions and Supabase client.
- `src/actions`: Server Actions for secure backend logic.
- `docs`: Project documentation and SQL scripts.
