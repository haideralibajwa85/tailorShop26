# Stitcher Visibility & Assignment Changes

This document tracks the changes made to the user interface to manage team member visibility, specifically focusing on hiding inactive staff from various parts of the system.

## Objective
To ensure that only **Active** team members (Stitchers) are visible in dashboards and assignment dropdowns, preventing the accidental assignment of work to offline staff and decluttering the UI.

## Change History

### 1. Inactive Stitchers Hidden from Dashboard "My Team" List
*   **Date:** 2026-01-14
*   **File:** `src/app/tailor/dashboard/page.tsx`
*   **Change:** Updated the "My Team" sidebar component to filter the stitchers list by `is_active: true`.
*   **Impact:** Offline members no longer appear in the quick-view sidebar.

### 2. Inactive Stitchers Hidden from Dashboard "Live Work Tracker" Dropdown
*   **Date:** 2026-01-14
*   *   **File:** `src/app/tailor/dashboard/page.tsx`
*   **Change:** Filtered the stitcher selection dropdown in the production table to only show active members.
*   **Impact:** Tailors can only assign live orders to active staff directly from the tracker.

### 3. Inactive Stitchers Hidden from New Order Assignment Dropdown
*   **Date:** 2026-01-14
*   **File:** `src/app/tailor/orders/new/page.tsx`
*   **Change:** Filtered the stitcher choice list in the new order creation form to exclude inactive members.
*   **Impact:** Prevents assigning new orders to offline stitchers at the moment of creation.

### 4. Inactive Stitchers Hidden from Assigned Orders List Dropdown
*   **Date:** 2026-01-14
*   **File:** `src/app/tailor/orders/page.tsx`
*   **Change:** Filtered the stitcher dropdown in the "Assigned Orders" management page.
*   **Impact:** Consistent filtering across all assignment interfaces.

## Summary of Logic
In all instances, the following filter is applied to the staff data:
```javascript
stitchers.filter((s) => s.is_active)
```

Offline team members remain accessible for management (editing, reactivating) through the primary team management page (`/tailor/stitchers`).
