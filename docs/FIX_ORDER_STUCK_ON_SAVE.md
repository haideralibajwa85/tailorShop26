# Order Creation System "Stuck on Save" Investigation

This document details the investigation and diagnostic fixes for the report that some members are unable to complete orders, as the system gets stuck on the "Saving" state.

## Potential Causes Identified

1.  **Missing Profile Data**: If a tailor's profile or session fails to load correctly, the save logic might attempt to reference undefined IDs (e.g., `tailor_id` or `organization_id`), leading to a crash.
2.  **Order ID Collisions**: The current system generates a 4-digit numeric ID (`TS-xxxx`). In high-volume environments, collisions are mathematically likely. A unique constraint violation in the database would trigger an error.
3.  **Silent Failures**: Previous versions of the code had minimal logging in the critical `handleSubmit` path, making it difficult to distinguish between a hanging network request, an RLS policy rejection, or a code-level exception.
4.  **Sequential Async Bottlenecks**: The order creation involves three sequential database hits (Order -> Measurements -> Assignment). A failure or delay in any of these steps could leave the UI in an inconsistent state if not handled robustly.

## Changes Implemented

### 1. Robust Diagnostic Logging
Added comprehensive `console.log` and `console.error` statements throughout the `handleSubmit` flow in `src/app/tailor/orders/new/page.tsx`.
- **Start/End Trackers**: Logs when the process starts and when the `finally` block executes.
- **Dependency Checks**: Explicitly checks and logs if the `tailorProfile` or `selectedCustomer` is missing before attempting a save.
- **Step-by-Step Updates**: Logs the success/failure of each sub-operation (Order insertion, Measurements, Assignment).

### 2. Improved Error Visibility
- Updated the `catch` block to provide more descriptive error messages to the user via `toast.error`.
- Ensured the `loading` state is **always** reset using a `finally` block, preventing the button from being permanently stuck in the "Saving..." state even if a crash occurs.

### 3. Order ID Resilience
- Increased the entropy of the human-readable `order_id` generator from 4 digits to 5 digits (`TS-xxxxx`) to significantly reduce the risk of collisions during the trial and growth phases.

## Next Steps for Monitoring
Affected members should be asked to:
1.  Open the browser console (F12) and check for logs starting with `Order Submission Debug`.
2.  Report any "CRITICAL ERROR" messages or "non-blocking" errors that appear in the console or as toast notifications.
3.  Verify if the page redirects to the dashboard after the "Process complete" log entry.

By having these logs in place, we can now pinpoint the exact line or database policy that is causing the hang for specific users.
