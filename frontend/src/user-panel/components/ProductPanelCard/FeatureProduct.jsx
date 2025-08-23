// Featured Products Section
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../api/api";
import ProductCard from "./productcard/ProductCard";
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



const FeaturedProducts = ({ title, subtitle }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await apiService.getProducts();
        // Get first 8 products for featured section
        setProducts(data.slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          {subtitle}
        </p>
        
        {/* Divider */}
        <div className="flex items-center justify-center">
          <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex flex-wrap justify-center gap-8">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No products available at the moment.</p>
            <p className="text-gray-400">Check back soon for amazing deals!</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>

      {/* View All Button */}
      {products.length > 0 && (
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            View All Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;