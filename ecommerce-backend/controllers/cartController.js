const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Helper function to calculate final price (same logic as ProductPage)
const calculateFinalPrice = (product) => {
  const unitPrice = product.price || 0;
  const profit = product.profit || 0;
  const sellingPrice = product.sellingPrice || (unitPrice + profit);
  const offerValue = product.offerValue || 0;
  const finalPrice = product.finalPrice || (sellingPrice - offerValue);
  
  return finalPrice;
};

// Create or update cart
exports.addToCart = async (req, res) => {
  const userId = req.user.userId;
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    // Use final price instead of unit price
    const finalPrice = calculateFinalPrice(product);
    const itemTotal = finalPrice * quantity;

    let cart = await Cart.findOne({ userId: userId, status: 'active' });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{
          productId,
          name: product.title,
          quantity,
          price: finalPrice, // Store final price, not unit price
          totalPrice: itemTotal
        }]
      });
    } else {
      const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].totalPrice += itemTotal;
      } else {
        cart.items.push({
          productId,
          name: product.title,
          quantity,
          price: finalPrice, // Store final price, not unit price
          totalPrice: itemTotal
        });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get current cart
exports.getCart = async (req, res) => {
  try {
    // 1. extract the raw ObjectId string
    const userId = req.user.userId;

    // 2. query by that string - FIXED: Include all pricing fields
    const cart = await Cart.findOne({ userId, status: 'active' })
      .populate(
        'items.productId',
        'title companyName description price profit sellingPrice offerValue finalPrice image specifications stock thumbnail'
      );

    // 3. if no cart yet, return an empty structure (optional)
    if (!cart) {
      return res.json({ items: [], total: 0 });
    }

    // 4. send the populated cart back
    res.json(cart);
  } catch (err) {
    console.error('getCart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update item quantity in cart - FIXED METHOD
exports.updateCartItemQuantity = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.userId;

  try {
    // Validate quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({ msg: 'Invalid quantity. Must be at least 1.' });
    }

    // Find the cart
    const cart = await Cart.findOne({ userId, status: 'active' });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }

    // Get the product to check stock and get current price
    const product = await Product.findById(cart.items[itemIndex].productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if requested quantity is available in stock
    if (quantity > product.stock) {
      return res.status(400).json({ 
        msg: `Only ${product.stock} items available in stock`,
        maxQuantity: product.stock
      });
    }

    // FIXED: Use final price instead of sellingPrice
    const finalPrice = calculateFinalPrice(product);
    
    // Update the quantity and total price
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = finalPrice; // Use final price
    cart.items[itemIndex].totalPrice = finalPrice * quantity;

    // Save the cart
    await cart.save();

    // Populate the updated cart before sending response - FIXED: Include all pricing fields
    const populatedCart = await Cart.findOne({ userId, status: 'active' })
      .populate(
        'items.productId',
        'title companyName description price profit sellingPrice offerValue finalPrice image specifications stock thumbnail'
      );

    res.json({
      success: true,
      msg: 'Cart item quantity updated successfully',
      cart: populatedCart
    });

  } catch (err) {
    console.error('updateCartItemQuantity error:', err);
    res.status(500).json({ msg: 'Server error while updating cart item quantity' });
  }
};

// Remove an item from cart - FIXED
exports.removeItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user.userId, status: 'active' });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    // Return populated cart - FIXED: Include all pricing fields
    const populatedCart = await Cart.findOne({ userId: req.user.userId, status: 'active' })
      .populate(
        'items.productId',
        'title companyName description price profit sellingPrice offerValue finalPrice image specifications stock thumbnail'
      );

    res.json(populatedCart || { items: [], total: 0 });
  } catch (err) {
    console.error('removeItem error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Clear the cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId, status: 'active' });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });

    cart.items = [];
    await cart.save();
    res.json({ msg: 'Cart cleared', cart });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};