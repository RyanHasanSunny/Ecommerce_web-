const mongoose = require('mongoose');
const Product = require('./models/productModel');

async function migrateSellingPrice() {
  try {
    // Connect to MongoDB
    const MONGO_URI = 'mongodb+srv://mymagicmart:MagicMart1234@cluster0.6ea8k8c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Recalculate sellingPrice and finalPrice based on new logic
        const newSellingPrice = product.price + product.expectedProfit + (product.deliveryCharge || 0);
        const newFinalPrice = newSellingPrice - (product.offerValue || 0);

        // Ensure final price is not negative
        const finalPrice = Math.max(0, newFinalPrice);

        if (product.sellingPrice !== newSellingPrice || product.finalPrice !== finalPrice) {
          product.sellingPrice = newSellingPrice;
          product.finalPrice = finalPrice;

          await product.save();
          updatedCount++;
          console.log(`Updated product ${product._id} (${product.title}): sellingPrice ${newSellingPrice}, finalPrice ${finalPrice}`);
        }
      } catch (err) {
        console.error(`Error updating product ${product._id}:`, err.message);
        errorCount++;
      }
    }

    console.log(`Migration completed:`);
    console.log(`- Updated products: ${updatedCount}`);
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
  migrateSellingPrice();
}

module.exports = migrateSellingPrice;
