const mongoose = require('mongoose');
const Product = require('./models/productModel');

async function checkProduct() {
  try {
    const MONGO_URI = 'mongodb+srv://mymagicmart:MagicMart1234@cluster0.6ea8k8c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({}).limit(5);
    products.forEach(p => {
      console.log(`${p.title}:`, {
        price: p.price,
        profit: p.profit,
        deliveryCharge: p.deliveryCharge,
        sellingPrice: p.sellingPrice,
        offerValue: p.offerValue,
        finalPrice: p.finalPrice,
        expectedSellingPrice: p.price + p.profit + (p.deliveryCharge || 0) - (p.offerValue || 0)
      });
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkProduct();
