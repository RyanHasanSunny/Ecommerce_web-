import React, { useState, useMemo, useEffect } from "react";
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
  ArrowUpDown
} from "lucide-react";

// Sample product data
const sampleProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    category: "Electronics",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviews: 1245,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    badge: "Best Seller",
    inStock: true,
    description: "High-quality wireless headphones with noise cancellation"
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    category: "Electronics",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.6,
    reviews: 856,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    badge: "New Arrival",
    inStock: true,
    description: "Advanced fitness tracking with heart rate monitor"
  },
  {
    id: 3,
    name: "Designer Handbag",
    category: "Fashion",
    price: 159.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 432,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    badge: "Limited Edition",
    inStock: true,
    description: "Elegant leather handbag perfect for any occasion"
  },
  {
    id: 4,
    name: "Ergonomic Office Chair",
    category: "Home",
    price: 449.99,
    originalPrice: 599.99,
    rating: 4.7,
    reviews: 723,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    badge: "Sale",
    inStock: true,
    description: "Comfortable office chair with lumbar support"
  },
  {
    id: 5,
    name: "Organic Face Moisturizer",
    category: "Beauty",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.5,
    reviews: 298,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    badge: "Organic",
    inStock: true,
    description: "Natural moisturizer for all skin types"
  },
  {
    id: 6,
    name: "Professional Running Shoes",
    category: "Sports",
    price: 129.99,
    originalPrice: 169.99,
    rating: 4.4,
    reviews: 1567,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    badge: "Popular",
    inStock: false,
    description: "Lightweight running shoes for professional athletes"
  },
  {
    id: 7,
    name: "Educational Puzzle Set",
    category: "Toys",
    price: 39.99,
    originalPrice: null,
    rating: 4.8,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    badge: "Educational",
    inStock: true,
    description: "Interactive puzzle set for children's development"
  },
  {
    id: 8,
    name: "Programming Fundamentals Book",
    category: "Books",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.9,
    reviews: 892,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    badge: "Bestseller",
    inStock: true,
    description: "Comprehensive guide to programming fundamentals"
  },
  {
    id: 9,
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.3,
    reviews: 634,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    badge: "Portable",
    inStock: true,
    description: "Compact wireless speaker with rich sound"
  },
  {
    id: 10,
    name: "Vintage Sunglasses",
    category: "Fashion",
    price: 69.99,
    originalPrice: null,
    rating: 4.2,
    reviews: 278,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    badge: "Vintage",
    inStock: true,
    description: "Classic vintage-style sunglasses with UV protection"
  },
  {
    id: 11,
    name: "Smart Home Thermostat",
    category: "Home",
    price: 249.99,
    originalPrice: 299.99,
    rating: 4.6,
    reviews: 445,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    badge: "Smart",
    inStock: true,
    description: "WiFi-enabled smart thermostat with app control"
  },
  {
    id: 12,
    name: "Luxury Perfume",
    category: "Beauty",
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.7,
    reviews: 567,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    badge: "Luxury",
    inStock: true,
    description: "Premium fragrance with long-lasting scent"
  }
];

const categories = ["All", "Electronics", "Fashion", "Home", "Beauty", "Sports", "Toys", "Books"];
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" }
];

const ProductGrid = () => {
  const [products] = useState(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesPrice && matchesSearch;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        // Featured - keep original order
        break;
    }

    return filtered;
  }, [products, selectedCategory, priceRange, searchQuery, sortBy]);

  useEffect(() => {
    setFilteredProducts(processedProducts);
  }, [processedProducts]);

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 1000]);
    setSearchQuery("");
    setSortBy("featured");
  };

  const getBadgeColor = (badge) => {
    const colors = {
      "Best Seller": "bg-gradient-to-r from-yellow-400 to-orange-500",
      "New Arrival": "bg-gradient-to-r from-green-400 to-blue-500",
      "Sale": "bg-gradient-to-r from-red-400 to-pink-500",
      "Limited Edition": "bg-gradient-to-r from-purple-400 to-pink-500",
      "Popular": "bg-gradient-to-r from-blue-400 to-cyan-500",
      "Organic": "bg-gradient-to-r from-green-400 to-emerald-500",
      default: "bg-gradient-to-r from-gray-400 to-gray-500"
    };
    return colors[badge] || colors.default;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
              <p className="text-gray-600 mt-1">{filteredProducts.length} products found</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
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
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Category</h3>
                <div className="space-y-3">
                  {categories.map(category => (
                    <label key={category} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-colors ${
                        selectedCategory === category 
                          ? 'bg-orange-500 border-orange-500' 
                          : 'border-gray-300 group-hover:border-orange-300'
                      }`}>
                        {selectedCategory === category && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <span className={`text-sm ${
                        selectedCategory === category ? 'text-orange-600 font-medium' : 'text-gray-700'
                      }`}>
                        {category}
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
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Filters</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setPriceRange([0, 50])}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Under $50
                  </button>
                  <button 
                    onClick={() => setPriceRange([50, 150])}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    $50 - $150
                  </button>
                  <button 
                    onClick={() => setPriceRange([150, 300])}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    $150 - $300
                  </button>
                  <button 
                    onClick={() => setPriceRange([300, 1000])}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Over $300
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`group bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    {/* Product Image */}
                    <div className={`relative overflow-hidden ${
                      viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-square"
                    }`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Badge */}
                      {product.badge && (
                        <div className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold text-white rounded-full ${getBadgeColor(product.badge)}`}>
                          {product.badge}
                        </div>
                      )}

                      {/* Stock Status */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            wishlist.has(product.id)
                              ? "bg-red-500 text-white"
                              : "bg-white/90 text-gray-600 hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${wishlist.has(product.id) ? "fill-current" : ""}`} />
                        </button>
                        <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                      <div className={`${viewMode === "list" ? "flex justify-between items-start" : ""}`}>
                        <div className={viewMode === "list" ? "flex-1 pr-4" : ""}>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {product.name}
                          </h3>
                          
                          {viewMode === "list" && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {product.description}
                            </p>
                          )}

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{product.rating}</span>
                            <span className="text-sm text-gray-500">({product.reviews})</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl font-bold text-gray-900">
                              ${product.price}
                            </span>
                            {product.originalPrice && (
                              <>
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.originalPrice}
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <div className={viewMode === "list" ? "flex-shrink-0" : ""}>
                          <button
                            disabled={!product.inStock}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                              product.inStock
                                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:scale-105"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {product.inStock ? "Add to Cart" : "Out of Stock"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
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
              {/* Filter content would be the same as sidebar */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;