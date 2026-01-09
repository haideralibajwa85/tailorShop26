# Repeat Order / Template Feature Design

## Objective
Enable tailors to quickly repeat a previous order for a returning customer. When a customer is selected, the system should display their previous order categories. Clicking a category pre-fills the new order form with details from the last time they ordered that item.

## User Flow
1.  **Select Customer**: Tailor searches and selects a customer on the "New Order" page.
2.  **View History**: On the left sidebar (below customer details), a list of "Previous Categories" appears (e.g., "Kamiz", "Pant").
3.  **Select Template**: Tailor clicks "Kamiz".
4.  **Auto-Fill**: The main form on the right is instantly populated with:
    *   Clothing Type
    *   Fabric Type (optional, maybe reset?) -> User says "previous order values", so we keep it.
    *   Color (optional, maybe reset?) -> Keep it, tailor can edit.
    *   Stitching Style
    *   Gender
    *   Measurements (Critical: fetch latest measurements for this category).
5.  **Review & Edit**: Tailor reviews the pre-filled values, changes the date/fabric/color if needed, and saves.

## UI Implementation Details
**File**: `src/app/tailor/orders/new/page.tsx`

### Left Sidebar Changes
*   **New Section**: `Previous Orders`
*   **Visibility**: Only visible when `selectedCustomer` is not null.
*   **Content**: List of unique categories ordered by this customer.
    *   Display: Category Name + Last Order Date.
    *   Action: `onClick` -> triggers `handleTemplateSelect(orderData)`.

### Data Fetching
*   When `selectedCustomer` changes:
    *   Query `orders` table.
    *   Filter by `customer_id`.
    *   Order by `created_at` DESC.
    *   Group/Distinct by `category` (to show one "template" per category).

### Pre-fill Logic (`handleTemplateSelect`)
User functions to update:
*   `setFormData`:
    *   Category, Clothing Type, Gender, Quantity, Fabric, Color, Stitching Style.
    *   *Exclude*: `expected_completion_date`, `assigned_stitcher_id` (User normally sets these fresh).
*   `setMeasurements`:
    *   Fetch `order_measurements` for the selected `order_id` and populate state.

## Database Query
We need to fetch the latest order for each category for a specific customer.
```sql
SELECT DISTINCT ON (category) *
FROM orders
WHERE customer_id = '...'
ORDER BY category, created_at DESC;
```
*Note: Supabase JS syntax will be needed.*

## Schema Changes
None required. Uses existing `orders` and `order_measurements` tables.
