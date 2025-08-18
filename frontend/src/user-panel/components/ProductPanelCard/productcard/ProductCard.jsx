import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Star, 
  ShoppingBag, 
  Users, 
  ArrowRight,
  Sparkles,
  Gift,
  Zap,
  Heart,
  Eye,
  ShoppingCart,
  Loader,
  AlertCircle
} from "lucide-react";
import apiService from "../../../api/api";

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  // FIXED PRICING CALCULATIONS - Match ProductPage logic
  const getPricing = () => {
    const unitPrice = product.price || 0;
    const profit = product.profit || 0;
    const sellingPrice = product.sellingPrice || (unitPrice + profit);
    const offerValue = product.offerValue || 0;
    const finalPrice = product.finalPrice || (sellingPrice - offerValue);
    
    const hasDiscount = offerValue > 0;
    const discountPercentage = hasDiscount && sellingPrice > 0
      ? Math.round((offerValue / sellingPrice) * 100)
      : 0;

    return {
      unitPrice,
      profit,
      sellingPrice,
      offerValue,
      finalPrice,
      hasDiscount,
      discountPercentage
    };
  };

  const pricing = getPricing();
  const isOutOfStock = product.stock === 0;

  if (viewMode === 'list') {
    return (
      <div 
        className="flex flex-wrap bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex"
        onClick={handleProductClick}
      >
        {/* Image */}
        <div className="w-64 h-64 flex-shrink-0 relative">
          <img
            src={imageError ? '/placeholder-product.jpg' : product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          
          {pricing.hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {pricing.discountPercentage}% OFF
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.title}
            </h3>
            
            {product.companyName && (
              <p className="text-sm text-gray-600 mb-2">{product.companyName}</p>
            )}

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between">
            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                ৳{pricing.finalPrice.toFixed(2)}
              </span>
              {pricing.hasDiscount && (
                <span className="text-lg text-gray-500 line-through">
                  ৳{pricing.sellingPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleProductClick}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageError ? '/placeholder-product.jpg' : product.thumbnail}
          alt={product.title}
          className="w-70 h-70 object-cover transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {pricing.hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {pricing.discountPercentage}% OFF
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 w-70">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        
        {product.companyName && (
          <p className="text-sm text-gray-600 mb-2">{product.companyName}</p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ৳{pricing.finalPrice.toFixed(2)}
            </span>
            {pricing.hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ৳{pricing.sellingPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {pricing.hasDiscount && (
            <span className="text-xs font-semibold text-green-600">
              Save ৳{pricing.offerValue.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock <= 10 && product.stock > 0 && (
          <p className="text-xs text-orange-500 mt-1">Only {product.stock} left in stock!</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;