// src/user-panel/pages/productlist.jsx - FIXED VERSION

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiService from "../api/api";
import { 
  Filter, 
  Search, 
  Grid3x3, 
  List, 
  ChevronDown, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  X,
  SlidersHorizontal,
  Tag,
  TrendingUp,
  ArrowUpDown,
  Loader,
  AlertCircle
} from "lucide-react";

// Product Card Component
const ProductCard = ({ product, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await apiService.addToCart(product._id, 1);
      // Show success notification (you can implement toast here)
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist API call
  };

  const calculateDiscount = () => {
    if (product.offerPrice && product.offerPrice < product.sellingPrice) {
      return Math.round(((product.sellingPrice - product.offerPrice) / product.sellingPrice) * 100);
    }
    return 0;
  };

  const discount = calculateDiscount();
  const finalPrice = product.offerPrice || product.sellingPrice;
  const isOutOfStock = product.stock === 0;

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 flex"
        onClick={handleProductClick}
      >
        {/* Image */}
        <div className="w-48 h-48 flex-shrink-0 relative">
          <img
            src={imageError ? '/placeholder-product.jpg' : product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {discount}% OFF
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
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
              {product.title}
            </h3>
            
            {product.companyName && (
              <p className="text-sm text-gray-600 mb-2">{product.companyName}</p>
            )}

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8) · 267 reviews</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                ${finalPrice}
              </span>
              {discount > 0 && (
                <span className="text-lg text-gray-500 line-through">
                  ${product.sellingPrice}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full border transition-colors ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || isOutOfStock}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200"
      onClick={handleProductClick}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageError ? '/placeholder-product.jpg' : product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {discount}% OFF
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
          <button
            onClick={handleWishlistToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || isOutOfStock}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {addingToCart ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            <span>{addingToCart ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        
        {product.companyName && (
          <p className="text-sm text-gray-600 mb-2">{product.companyName}</p>
        )}

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 mr-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
          <span className="text-xs text-gray-600">(4.8)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ${finalPrice}
            </span>
            {discount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                ${product.sellingPrice}
              </span>
            )}
          </div>
          
          {discount > 0 && (
            <span className="text-xs font-semibold text-green-600">
              Save ${(product.sellingPrice - finalPrice).toFixed(2)}
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

// Main Product List Component
const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI State
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'featured',
    inStock: searchParams.get('inStock') === 'true'
  });

  // Sort options
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'name', label: 'Name: A to Z' }
  ];

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsData, categoriesData] = await Promise.all([
          apiService.getProducts(),
          apiService.getCategories()
        ]);

        setProducts(productsData);
        setCategories(categoriesData.categories || categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Category filter
      if (filters.category && product.category?._id !== filters.category) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(searchTerm);
        const matchesCompany = product.companyName?.toLowerCase().includes(searchTerm);
        const matchesDescription = product.description?.toLowerCase().includes(searchTerm);
        
        if (!matchesTitle && !matchesCompany && !matchesDescription) {
          return false;
        }
      }
      
      // Price filters
      const price = product.offerPrice || product.sellingPrice;
      if (filters.minPrice && price < parseFloat(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && price > parseFloat(filters.maxPrice)) {
        return false;
      }
      
      // Stock filter
      if (filters.inStock && product.stock === 0) {
        return false;
      }
      
      return true;
    });

    // Sort products
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = a.offerPrice || a.sellingPrice;
          const priceB = b.offerPrice || b.sellingPrice;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = a.offerPrice || a.sellingPrice;
          const priceB = b.offerPrice || b.sellingPrice;
          return priceB - priceA;
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
        // TODO: Sort by actual rating when available
        filtered.sort((a, b) => b.soldCount - a.soldCount);
        break;
      default:
        // Featured - keep original order or sort by soldCount
        filtered.sort((a, b) => b.soldCount - a.soldCount);
        break;
    }

    return filtered;
  }, [products, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'featured',
      inStock: false
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is handled by the filter change
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
              <p className="text-gray-600 mt-1">
                {processedProducts.length} product{processedProducts.length !== 1 ? 's' : ''} found
                {filters.search && ` for "${filters.search}"`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </form>

              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {Object.values(filters).some(v => v) && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                <div className="flex items-center gap-2">
                  {Object.values(filters).some(v => v) && (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Category</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={!filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-colors ${
                      !filters.category
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 group-hover:border-blue-300'
                    }`}>
                      {!filters.category && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className={`text-sm ${
                      !filters.category ? 'text-blue-600 font-medium' : 'text-gray-700'
                    }`}>
                      All Categories
                    </span>
                  </label>

                  {categories.map(category => (
                    <label key={category._id} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        value={category._id}
                        checked={filters.category === category._id}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-colors ${
                        filters.category === category._id
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 group-hover:border-blue-300'
                      }`}>
                        {filters.category === category._id && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <span className={`text-sm ${
                        filters.category === category._id ? 'text-blue-600 font-medium' : 'text-gray-700'
                      }`}>
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Filters</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleFilterChange('minPrice', '0');
                      handleFilterChange('maxPrice', '50');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Under $50
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange('minPrice', '50');
                      handleFilterChange('maxPrice', '150');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    $50 - $150
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange('minPrice', '150');
                      handleFilterChange('maxPrice', '300');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    $150 - $300
                  </button>
                  <button
                    onClick={() => {
                      handleFilterChange('minPrice', '300');
                      handleFilterChange('maxPrice', '');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Over $300
                  </button>
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Availability</h3>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            {Object.values(filters).some(v => v) && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Category: {categories.find(c => c._id === filters.category)?.name}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Search: "{filters.search}"
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Price: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                    <button
                      onClick={() => {
                        handleFilterChange('minPrice', '');
                        handleFilterChange('maxPrice', '');
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.inStock && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    In Stock Only
                    <button
                      onClick={() => handleFilterChange('inStock', false)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products */}
            {processedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  {filters.search || filters.category || filters.minPrice || filters.maxPrice 
                    ? "Try adjusting your filters or search terms"
                    : "No products available at the moment"
                  }
                </p>
                {Object.values(filters).some(v => v) && (
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {processedProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Load More / Pagination (for future implementation) */}
            {processedProducts.length > 0 && (
              <div className="mt-12 text-center">
                <p className="text-gray-600 mb-4">
                  Showing {processedProducts.length} of {products.length} products
                </p>
                {/* TODO: Implement pagination */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile filter content would be the same as desktop sidebar */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Same filter content as sidebar */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;