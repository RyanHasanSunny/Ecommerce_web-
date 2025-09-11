import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, addToCart } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight, ShoppingCart, Heart, Eye } from "lucide-react";

const ProductCard = ({ thumbnail, title, sellingPrice, offerPrice, productId, onClick }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();

  const calculateDiscount = () => {
    if (offerPrice && offerPrice < sellingPrice) {
      const discount = ((sellingPrice - offerPrice) / sellingPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      alert('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(productId, 1);
      alert(`${title} added to cart!`);
      // Dispatch event to update header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    console.log(`Quick view for ${title}`);
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Discount Badge */}
        {calculateDiscount() > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {calculateDiscount()}% OFF
          </div>
        )}

        {/* Action Buttons */}
        <div className={`absolute top-4 right-4 flex flex-col space-y-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={handleWishlist}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleQuickView}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add to Cart */}
        <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              ৳{offerPrice || sellingPrice}
            </span>
            {offerPrice && offerPrice < sellingPrice && (
              <span className="text-lg text-gray-500 line-through">
                ৳{sellingPrice}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            ))}
            <span className="text-sm text-gray-600 ml-1">(4.8)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductPanel = ({ title, subtitle }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.slice(0, 8)); // Show only first 8 products
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleViewAll = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          {subtitle}
        </p>
        
        {/* Divider */}
        <div className="flex items-center justify-center">
          <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-xl text-gray-500">No products available at the moment.</p>
            <p className="text-gray-400">Check back soon for amazing deals!</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product._id}
              productId={product._id}
              thumbnail={product.thumbnail}
              title={product.title}
              sellingPrice={product.sellingPrice}
              offerPrice={product.offerPrice}
              onClick={() => handleProductClick(product._id)}
            />
          ))
        )}
      </div>

      {/* View All Button */}
      {products.length > 0 && (
        <div className="text-center mt-12">
          <button
            onClick={handleViewAll}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            View All Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductPanel;