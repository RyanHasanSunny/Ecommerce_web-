import React, { useState, useEffect } from "react";
import { ShoppingCart, Search, User, LogOut, Settings, Menu, X, Heart, MapPin } from "lucide-react";

// Mock auth context for demo
const useAuth = () => ({
  isAuthenticated: () => true,
  logout: () => console.log("Logged out")
});

// Mock navigate for demo
const useNavigate = () => () => console.log('Navigate');

export const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const categories = [
    "Electronics", "Fashion", "Home & Garden", "Beauty", "Sports", "Toys", "Books", "Automotive"
  ];

  const navigationItems = [
    { label: "Home", href: "/" },
    { label: "New Arrivals", href: "/new" },
    { label: "Best Sellers", href: "/bestsellers" },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
    }`}>
      {/* Top Banner */}
      <div className="bg-orange-200  text-sm py-2 px-4 text-center">
        <div className="flex items-center justify-center text-black gap-2">
          <MapPin className="w-4 h-4" />
          <span> Free Shipping on Orders Over 1000TK. </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  MAGIC MART
                </h1>
              </div>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className="w-full px-4 py-2 pl-12 pr-4 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search */}
              <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button className="hidden sm:block p-2 text-gray-600 hover:text-gray-900 relative">
                <Heart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
              </button>

              {/* Cart */}
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
              </button>

              {/* User Account */}
              {isAuthenticated() ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:scale-105 transition-transform duration-200"
                  >
                    <User className="w-4 h-4" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">John Doe</p>
                        <p className="text-xs text-gray-500">john@example.com</p>
                      </div>
                      <a
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                      </a>
                      <a
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        My Orders
                      </a>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <a
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    Login
                  </a>
                  <a
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-full hover:shadow-lg transition-all duration-200"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      {/* <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-3">
            <ul className="flex space-x-8">
              {categories.map((category) => (
                <li key={category}>
                  <a
                    href={`/category/${category.toLowerCase()}`}
                    className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors duration-200"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div> */}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Mobile Categories */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 6).map((category) => (
                  <a
                    key={category}
                    href={`/category/${category.toLowerCase()}`}
                    className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    {category}
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile Auth */}
            {!isAuthenticated() && (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <a
                  href="/login"
                  className="block w-full px-4 py-2 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;