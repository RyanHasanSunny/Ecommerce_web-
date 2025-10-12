# Data Migration: Fix Order Pricing Calculations

## Tasks
- [x] Create migration script to recalculate profit as (finalPrice - unitPrice) × quantity
- [x] Update totalSellingPrice to use finalPrice instead of sellingPrice (actual revenue received)
- [x] Fix orderController.js placeOrder function to use correct pricing calculations
- [x] Update calculateOrderRevenue function with same fixes
- [x] Run migration on existing orders to correct historical data

## Information Gathered
- Product pricing changed: sellingPrice = price + profit + deliveryCharge - offerValue, finalPrice = sellingPrice
- Order profit calculation was wrong: was using (profit - offerValue) instead of (finalPrice - unitPrice)
- totalSellingPrice was using sellingPrice instead of finalPrice (actual revenue)

## Plan
1. Create migration script to fix existing orders
2. Update orderController.js placeOrder function
3. Update calculateOrderRevenue function
4. Run migration to correct all historical order data

## Dependent Files
- ecommerce-backend/migrate-order-pricing-fixed.js (new migration script)
- ecommerce-backend/controllers/orderController-fixed.js (updated controller)
- ecommerce-backend/models/orderModel.js (already updated)

## Followup Steps
- [ ] Test new orders to ensure correct pricing calculations
- [ ] Verify order statistics show accurate profit figures
- [ ] Monitor revenue reporting for accuracy

## Completed Changes
- **Migration Script**: Created `migrate-order-pricing-fixed.js` that recalculates:
  - totalProfit = (finalPrice - unitPrice) × quantity (actual profit received)
  - totalSellingPrice = finalPrice × quantity (actual revenue received)
  - netProfit = totalProfit - discountAmount
- **Order Controller**: Updated `placeOrder` function to use finalPrice for totalSellingPrice
- **Revenue Function**: Updated `calculateOrderRevenue` to use finalPrice for totalSellingPrice
- **Migration Results**: Successfully updated 2 orders with correct profit calculations
- **Before/After**: Profit corrected from fixed margin to actual revenue minus cost (e.g., 210 actual profit vs 500 fixed margin)
