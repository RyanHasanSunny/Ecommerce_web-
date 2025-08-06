import React from "react";
import { Helmet } from "react-helmet";
import Heropanel from "../../user-panel/Sections/Heropanel/Heropanel";
import ProductPanel from "../../user-panel/components/ProductPanelCard/ProductPanel";
import ServiceSection from "../../user-panel/components/Service/Services";
import ReviewSection from "../../user-panel/components/Review/Review";
import { 
  TrendingUp, 
  Star, 
  ShoppingBag, 
  Users, 
  ArrowRight,
  Sparkles,
  Gift,
  Zap,
  Heart
} from "lucide-react";

export const HomePage = () => {
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
      description: "Latest gadgets and tech"
    },
    {
      name: "Fashion",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      icon: Heart,
      description: "Trendy clothing & accessories"
    },
    {
      name: "Home & Living",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      icon: Gift,
      description: "Beautiful home essentials"
    }
  ];

  return (
    <>
      <Helmet>
        <meta name="description" content="Discover amazing products with unbeatable prices. Shop electronics, fashion, home goods and more with fast shipping and excellent customer service." />
        <meta property="og:title" content="Premium E-Commerce Store" />
        <meta property="og:description" content="Quality products, unbeatable prices, fast shipping" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="home-page min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-white">
          <Heropanel />
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Welcome to Premium Shopping</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Discover Amazing
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Products
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Shop with confidence. Quality products, unbeatable prices, and exceptional service.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center">
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-16 -mt-8 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4 ${stat.color}`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                      <div className="text-gray-600 font-medium">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <div 
                    key={index} 
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
                      <button className="inline-flex items-center text-white font-semibold hover:text-yellow-400 transition-colors duration-200">
                        Explore Collection
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Special Offers Section */}
        <section className="py-20 bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
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
              
              <button className="bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center mx-auto">
                Shop Sale Items
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </section>

        {/* Products Sections */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductPanel
              title="🔥 Hot Deals"
              subtitle="Limited time offers you can't miss"
            />
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductPanel
              title="✨ New Arrivals"
              subtitle="Fresh products just for you"
            />
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose Us?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We're committed to providing you with the best shopping experience
              </p>
            </div>
            <ServiceSection />
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stay in the Loop
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about new products, exclusive offers, and special events.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-400 transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        {/* <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ReviewSection />
          </div>
        </section> */}
      </div>
    </>
  );
};