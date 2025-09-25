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
  const truncateWords = (str = "", n = 8) => {
    const words = str.trim().split(/\s+/);
    return words.length > n ? words.slice(0, n).join(" ") + "…" : str;
  };
  // Grid view
  return (
    <div
      className="group bg-white min-w-30 max-w-47 lg:max-w-70 md:max-w-70 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleProductClick}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageError ? '/placeholder-product.jpg' : product.thumbnail}
          alt={product.title}
          className="w-full h-auto object-cover transition-transform duration-300"
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
      <div className="p-2 lg:p-4 md:p-2 w-full">
        <p
          className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors"
          title={product.title} // shows full title on hover
        >
          {truncateWords(product.title, 8)}  {/* adjust 6 to the word-count you want */}
        </p>

        {product.companyName && (
          <p className="text-sm text-gray-600 mb-2">{product.companyName}</p>
        )}


        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center space-x-2">
            <span className="text-sm font-bold text-gray-900">
              ৳{pricing.finalPrice.toFixed(2)}
            </span>
            {pricing.hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ৳{pricing.sellingPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* {pricing.hasDiscount && (
            <span className="text-sm font-semibold text-green-600">
              Save ৳{pricing.offerValue.toFixed(2)}
            </span>
          )} */}
        </div>


        {product.stock <= 10 && product.stock > 0 && (
          <p className="text-xs text-orange-500 mt-1">Only {product.stock} left in stock!</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;