const mongoose = require('mongoose');
const Order = require('./models/orderModel');

async function checkOrder() {
  try {
    const MONGO_URI = 'mongodb+srv://mymagicmart:MagicMart1234@cluster0.6ea8k8c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const order = await Order.findById('68e8d19d864a029a348b878c');
    if (order) {
      console.log('Order items:');
      order.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          unitPrice: item.unitPrice,
          profit: item.profit,
          deliveryCharge: item.deliveryCharge,
          sellingPrice: item.sellingPrice,
          offerValue: item.offerValue,
          finalPrice: item.finalPrice,
          totalPrice: item.totalPrice,
          quantity: item.quantity
        });
      });
      console.log('Order totals:', {
        totalUnitPrice: order.totalUnitPrice,
        totalProfit: order.totalProfit,
        totalSellingPrice: order.totalSellingPrice,
        totalOfferValue: order.totalOfferValue,
        netProfit: order.netProfit
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkOrder();
