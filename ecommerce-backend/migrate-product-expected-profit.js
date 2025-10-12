const mongoose = require('mongoose');
const Product = require('./models/productModel');

async function migrateProductExpectedProfit() {
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
        // Check if expectedProfit is missing
        if (product.expectedProfit === undefined || product.expectedProfit === null) {
          // Set expectedProfit to existing profit field if present, otherwise 0
          const expectedProfit = product.profit !== undefined ? product.profit : 0;

          product.expectedProfit = expectedProfit;

          // Remove the old profit field if it exists
          if (product.profit !== undefined) {
            product.profit = undefined;
          }

          await product.save();
          updatedCount++;
          console.log(`Updated product ${product._id} (${product.title}): set expectedProfit to ${expectedProfit}`);
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
  migrateProductExpectedProfit();
}

module.exports = migrateProductExpectedProfit;
