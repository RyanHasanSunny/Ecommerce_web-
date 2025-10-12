const mongoose = require('mongoose');
const Order = require('./models/orderModel');

async function migrateOrderPricing() {
  try {
    // Connect to MongoDB
    const MONGO_URI = 'mongodb+srv://mymagicmart:MagicMart1234@cluster0.6ea8k8c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all orders
    const orders = await Order.find({ isDeleted: { $ne: true } });
    console.log(`Found ${orders.length} orders to migrate`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        // Recalculate revenue metrics for each order
        let totalUnitPrice = 0;
        let totalProfit = 0;
        let totalProductDeliveryCharge = 0;
        let totalSellingPrice = 0;
        let totalOfferValue = 0;

        order.items.forEach(item => {
          const quantity = item.quantity;

          // Use the stored item pricing data
          totalUnitPrice += (item.unitPrice || 0) * quantity;
          // FIXED: Profit should be based on actual revenue received (finalPrice - unitPrice)
          totalProfit += ((item.finalPrice || item.totalPrice) - (item.unitPrice || 0)) * quantity;
          totalProductDeliveryCharge += (item.deliveryCharge || 0) * quantity;
          totalSellingPrice += ((item.finalPrice || item.totalPrice) || 0) * quantity; // FIXED: Use finalPrice (actual revenue received)
          totalOfferValue += (item.offerValue || 0) * quantity;
        });

        // Calculate net profit: total profit minus any promo discount
        const netProfit = totalProfit - (order.discountAmount || 0);

        // Check if any values changed
        const hasChanges =
          order.totalUnitPrice !== totalUnitPrice ||
          order.totalProfit !== totalProfit ||
          order.totalProductDeliveryCharge !== totalProductDeliveryCharge ||
          order.totalSellingPrice !== totalSellingPrice ||
          order.totalOfferValue !== totalOfferValue ||
          order.netProfit !== netProfit;

        if (hasChanges) {
          // Update the order with corrected values
          order.totalUnitPrice = totalUnitPrice;
          order.totalProfit = totalProfit;
          order.totalProductDeliveryCharge = totalProductDeliveryCharge;
          order.totalSellingPrice = totalSellingPrice;
          order.totalOfferValue = totalOfferValue;
          order.netProfit = netProfit;

          await order.save();
          updatedCount++;
          console.log(`Updated order ${order._id}: profit ${order.totalProfit} -> ${totalProfit}, sellingPrice ${order.totalSellingPrice} -> ${totalSellingPrice}`);
        }

      } catch (err) {
        console.error(`Error updating order ${order._id}:`, err.message);
        errorCount++;
      }
    }

    console.log(`Migration completed:`);
    console.log(`- Updated orders: ${updatedCount}`);
    console.log(`- Errors: ${errorCount}`);

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateOrderPricing();
}

module.exports = migrateOrderPricing;
