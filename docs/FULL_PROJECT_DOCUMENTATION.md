# Tailor Shop Management System - Full Project Documentation

## 1. Executive Summary
The **Tailor Shop Management System** is a professional-grade, multi-tenant SaaS platform designed to streamline the operations of modern tailoring businesses. It provides full-lifecycle management for custom clothing orders, from customer onboarding and measurements to stitcher assignment and financial settlement.

---

## 2. Technical Architecture
### 2.1 Core Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict mode)
- **Database & Authentication**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom premium color palettes.
- **Internationalization**: `i18next` with support for English (**en**), Arabic (**ar**), and Urdu (**ur**).
- **Communication**: React Hot Toast for real-time feedback.

### 2.2 Security Model
- **RBAC (Role-Based Access Control)**: Enforced via Next.js Middleware and Supabase Row Level Security (RLS).
- **Multi-Tenancy**: Data is isolated by `organization_id`, ensuring shop-level privacy.
- **Session Management**: Secure server-side user verification using `auth.getUser()`.

---

## 3. User Roles & Modules
### 3.1 Superadmin
- Global oversight of all registered organizations.
- Management of system-wide categories and clothing types.

### 3.2 Shop Admin
- Staff management (Registering and managing Tailors and Stitchers).
- Shop-level reporting and financial overview.

### 3.3 Tailor (The Power User)
- **Dashboard**: Live Work Tracker with real-time assignment controls.
- **Order Management**: Comprehensive multi-step order creation.
- **Customer Management**: Registering new customers via phone/SMS logic.
- **Repeat Orders**: Template system to load previous measurements in one click.

### 3.4 Customer
- Tracking active orders.
- Viewing order history and digital measurement records.

### 3.5 Stitcher
- Individual task dashboard (Mobile-optimized).
- Status updates (Marking tasks as "In Progress" or "Completed").

---

## 4. Feature Highlights & Critical Fixes (Recent)
### 4.1 Advanced Stitcher Assignment
- **Unassignment Support**: Tailors can now clear assignments (set to "Unassigned"), which cleans up the database correctly.
- **Real-time Tracker**: Added a "Delivery Date" column to the dashboard for better prioritization.
- **Conflict Prevention**: Database now enforces a `UNIQUE` constraint on `order_id` in the `work_assignments` table to prevent duplicate tasks.

### 4.2 Order Creation Resilience
- **Stuck-on-Save Fix**: Implemented `finally` blocks in all save functions to ensure the UI never hangs in a "Saving..." state if a network error occurs.
- **Diagnostic Suite**: Added comprehensive "Order Submission Debug" logs to the browser console to identify environment-specific issues.
- **ID Generation**: Increased Order ID entropy to 5 digits (`TS-xxxxx`) to eliminate database collisions.

### 4.3 Authentication & UI
- **Controlled Growth**: Public signup links have been removed. User registration is now handled internally by Admins/Tailors to maintain shop integrity.
- **Staff Filtering**: Dropdowns across the app now only show "Active" team members.
- **Session Reliability**: Middleware now gracefully handles expired refresh tokens without cluttering the developer logs.

---

## 5. Database Schema (Schema Registry)
### 5.1 `public.users`
- `id`, `email`, `phone`, `full_name`, `role`, `organization_id`, `is_active`.

### 5.2 `public.orders`
- `id`, `order_id` (TS-xxxxx), `customer_id`, `tailor_id`, `status`, `category`, `clothing_type`, `total_amount`, `advance_amount`, `expected_completion_date`.

### 5.3 `public.order_measurements`
- Detailed fields for upper and lower body measurements linked to `order_id`.

### 5.4 `public.work_assignments`
- `id`, `order_id` (Unique), `stitcher_id`, `tailor_id`, `status` (pending/completed).

### 5.5 Lookup Tables
- `categories`, `clothing_types` (linked by `category_id`).

---

## 6. Setup & Deployment Guide
### 6.1 Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6.2 Required Database Migrations
To ensure full functionality, the following SQL must be run in the Supabase Editor:
1.  Add `tailor_id` to `work_assignments`.
2.  Add `UNIQUE` constraint to `work_assignments.order_id`.
3.  Ensure RLS policies allow Tailors to select active Stitchers.

---

## 7. Current Project Status
- **Core Modules**: 100% Functional.
- **Assignment Logic**: Optimized and Bug-free.
- **Dashboard Visibility**: Enhanced with Delivery Dates.
- **Security**: Hardened via Middleware and filtered visibility.
