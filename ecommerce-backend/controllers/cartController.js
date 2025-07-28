const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Create or update cart
exports.addToCart = async (req, res) => {
  const userId = req.user;
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    const itemTotal = product.price * quantity;

    let cart = await Cart.findOne({ userId, status: 'active' });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{
          productId,
          name: product.title,
          quantity,
          price: product.price,
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
          price: product.price,
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
    const cart = await Cart.findOne({ userId: req.user, status: 'active' })
      .populate('items.productId', 'title companyName description price image specifications');

    if (!cart) return res.status(404).json({ msg: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Remove an item from cart
exports.removeItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user, status: 'active' });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Clear the cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user, status: 'active' });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });

    cart.items = [];
    await cart.save();
    res.json({ msg: 'Cart cleared', cart });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
