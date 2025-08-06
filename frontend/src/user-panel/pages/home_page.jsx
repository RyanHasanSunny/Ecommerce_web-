// src/user-panel/pages/home_page.jsx - FIXED VERSION

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeroPanel from "../Sections/Heropanel/Heropanel";
import apiService from "../api/api";
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

// Hero Carousel Component
const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
      title: "Summer Sale Extravaganza",
      subtitle: "Up to 70% off on trending items",
      cta: "Shop Now",
      ctaLink: "/products?sale=true",
      gradient: "from-orange-500 to-pink-500"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
      title: "Tech Revolution 2024",
      subtitle: "Latest gadgets at unbeatable prices",
      cta: "Explore Tech",
      ctaLink: "/products?category=electronics",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop",
      title: "Fashion Forward",
      subtitle: "New arrivals from top brands",
      cta: "Discover Fashion",
      ctaLink: "/products?category=fashion",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden rounded-2xl">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative w-full h-full flex-shrink-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-75`}></div>
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 animate-fade-in-delay">
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.ctaLink}
                  className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {slide.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play Control */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
        aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
      >
        {isAutoPlaying ? "⏸" : "▶"}
      </button>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

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
      // Show success feedback (you can implement toast here)
      alert('Added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const finalPrice = product.offerPrice || product.sellingPrice;
  const discount = product.offerPrice && product.offerPrice < product.sellingPrice 
    ? Math.round(((product.sellingPrice - product.offerPrice) / product.sellingPrice) * 100)
    : 0;

  return (
    <div 
      className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
      onClick={handleProductClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={imageError ? '/placeholder-product.jpg' : product.thumbnail}
          alt={product.title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageError(true)}
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {discount}% OFF
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:text-blue-500 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {addingToCart ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            <span>{addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        
        {product.companyName && (
          <p className="text-sm text-gray-500 mb-3">{product.companyName}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              ${finalPrice}
            </span>
            {discount > 0 && (
              <span className="text-lg text-gray-500 line-through">
                ${product.sellingPrice}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
            <span className="text-sm text-gray-500 ml-1">(4.8)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Featured Products Section
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

// Main HomePage Component
const HomePage = () => {
  const stats = [
    { icon: Users, label: "Happy Customers", value: "50K+", color: "text-blue-600" },
    { icon: ShoppingBag, label: "Products Sold", value: "100K+", color: "text-green-600" },
    { icon: Star, label: "5-Star Reviews", value: "25K+", color: "text-yellow-600" },
    { icon: TrendingUp, label: "Years Experience", value: "10+", color: "text-purple-600" }
  ];

  const categories = [
    {
      name: "Electronics",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      icon: Zap,
      description: "Latest gadgets and tech",
      link: "/products?category=electronics"
    },
    {
      name: "Fashion",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      icon: Heart,
      description: "Trendy clothing & accessories",
      link: "/products?category=fashion"
    },
    {
      name: "Home & Living",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      icon: Gift,
      description: "Beautiful home essentials",
      link: "/products?category=home"
    }
  ];

  return (
    <div className="home-page min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
       <HeroPanel/>
      </section>

      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold">
              Discover Amazing Products
            </h1>
            <Sparkles className="w-8 h-8 ml-3" />
          </div>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Shop with confidence. Quality products, unbeatable prices, and exceptional service.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Shop Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4 group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated collections designed to meet all your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link 
                  key={index} 
                  to={category.link}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center mb-2">
                      <IconComponent className="w-6 h-6 mr-2" />
                      <h3 className="text-2xl font-bold">{category.name}</h3>
                    </div>
                    <p className="text-gray-200 mb-4">{category.description}</p>
                    <div className="inline-flex items-center text-white font-semibold hover:text-yellow-400 transition-colors duration-200">
                      Explore Collection
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Gift className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Limited Time Offer</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Flash Sale! Up to 70% Off
          </h2>
          
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Don't miss out on incredible deals across all categories. Limited stock available!
          </p>
          
          <Link
            to="/products?sale=true"
            className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Shop Sale Items
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FeaturedProducts
            title="Featured Products"
            subtitle="Discover our handpicked selection of amazing products"
          />
        </div>
      </section>

      

      

      {/* Customer Reviews Section */}
    </div>
  );
};

export default HomePage;