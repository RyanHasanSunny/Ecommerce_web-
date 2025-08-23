import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroPanel from "../Sections/Heropanel/Heropanel";
import { getCategories } from '../../user-panel/api/api';

import apiService from "../api/api";
import FeaturedProducts from "../components/ProductPanelCard/FeatureProduct";
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
  ShoppingCart,
  Loader,
  AlertCircle
} from "lucide-react";

// Main HomePage Component
const HomePage = () => {
  const [homePageData, setHomePageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getCategories();
        // Ensure categories is always an array
        const list = Array.isArray(data) ? data : data.categories;
        // Filter only parent categories
        const parentCategories = list.filter(cat => cat.isParent);
        setCategories(parentCategories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getHomePage();
        setHomePageData(response.data || response);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError('Failed to load homepage data');
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" />
        <span className="ml-2 text-red-600">{error}</span>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-white">
      {/* Hero Section */}

      <HeroPanel heroData={homePageData?.heroPanel} />


      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-10">
        <div className=" mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 mr-3" />
            <h1 className="text-[20px] md:text-[20px] font-bold">
              Discover Amazing Products
            </h1>
            <Sparkles className="w-8 h-8 ml-3" />
          </div>
          <p className="text-blue-100 max-w-3xl mx-auto">
            Shop with confidence. Quality products, unbeatable prices, and exceptional service.
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container flex flex-col mx-auto  px-4">
          <div className="text-center mb-5">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
              Shop by Category
            </h1>
            <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated collections designed to meet all your needs
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${category._id}`}  // Use category._id for filtering products
                className="group relative bg-white rounded-xl py-2 px-5 justify-center text-center overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 no-underline"
              >
                <div className="overflow-hidden">
                  <h2 className="font-semibold">{category.name}</h2>
                </div>
              </Link>
            ))}
          </div>
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



      {/* Special Offers Section - Show only if enabled */}
      {homePageData?.offerPanel?.isEnabled && (
        <section className="py-20 bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Gift className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Limited Time Offer</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {homePageData.offerPanel.title || "Flash Sale! Up to 70% Off"}
            </h2>

            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              {homePageData.offerPanel.description || "Don't miss out on incredible deals across all categories. Limited stock available!"}
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
      )}

    </div>
  );
};

export default HomePage;
