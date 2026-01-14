# Filtering Dashboard Team Members

This document details the changes made to the Tailor Dashboard to ensure only active team members are displayed in the "My Team" card.

## Objective
To declutter the dashboard and prioritize showing staff who are currently active/online, as requested by the user.

## Modified Files

### 1. Tailor Dashboard Page
**File:** `src/app/tailor/dashboard/page.tsx`
- **Change:**
    - Applied a filter to the `stitchers` array in the "My Team" section to only include members where `is_active` is true.
    - Simplified the display to consistently show an "Active" badge for these members.
    - Updated the empty state message to "No active team members currently."
    - Removed the hover-only edit button from this specific dashboard list to focus on status visibility (full management is still available via "View All").
- **Impact:**
    - The "My Team" card now exclusively shows active stitchers.
    - Offline members are hidden from the dashboard view but remain accessible via the "View All" link which points to the full staff management page.
    - The "Live Work Tracker" dropdown still has access to the full staff list to ensure existing assignments remain visible and correct.

## Summary of Impact
- Improved dashboard clarity by removing inactive staff names.
- Maintained core functionality by keeping the full team list available on the dedicated management page.
