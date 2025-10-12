// src/user-panel/pages/ProductPage.jsx
// COMPLETE VERSION WITH DYNAMIC SOCIAL LINKS FROM BACKEND

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiService from "../api/api";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Award,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  AlertCircle,
  Loader,
  Clock,
  MapPin,
  Package,
  CreditCard,
  Info,
  MessageCircle,
  Phone,
  Mail
} from "lucide-react";

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedTab, setSelectedTab] = useState("description");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedCity, setSelectedCity] = useState('dhaka');
  const [contactInfo, setContactInfo] = useState(null);
  const [contactLoading, setContactLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const fetched = await apiService.getProductById(productId);
        setProduct(fetched);

        // Meta Pixel ViewContent event
        if (fetched && window.fbq) {
          const pricing = getPricing(fetched);
          if (pricing) {
            window.fbq('track', 'ViewContent', {
              content_ids: [fetched._id],
              content_type: 'product',
              value: pricing.finalPrice,
              currency: 'BDT'
            });
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setContactLoading(true);
        const response = await apiService.getHomePage();
        const homePageData = response.data || response;
        if (homePageData?.contactInfo) {
          setContactInfo(homePageData.contactInfo);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      } finally {
        setContactLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const images = [product?.thumbnail, ...(product?.images || [])].filter(Boolean);

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex(prev =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex(prev =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  // CORRECTED PRICING CALCULATIONS
  const getPricing = () => {
    if (!product) return null;

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

  // Calculate delivery charge based on location
  const getDeliveryCharge = () => {
    return selectedCity === 'dhaka' ? 60 : 120;
  };

  // Get social links from backend data
  const getSocialLinks = () => {
    if (!contactInfo?.socialLinks) return [];
    
    return contactInfo.socialLinks.map(link => {
      const platform = link.platform.toLowerCase();
      let icon, bgColor, hoverColor;
      
      switch (platform) {
        case 'whatsapp':
          icon = MessageCircle;
          bgColor = 'bg-green-500';
          hoverColor = 'hover:bg-green-600';
          break;
        case 'messenger':
        case 'facebook':
          icon = MessageCircle;
          bgColor = 'bg-blue-500';
          hoverColor = 'hover:bg-blue-600';
          break;
        case 'telegram':
          icon = MessageCircle;
          bgColor = 'bg-blue-400';
          hoverColor = 'hover:bg-blue-500';
          break;
        case 'viber':
          icon = Phone;
          bgColor = 'bg-purple-500';
          hoverColor = 'hover:bg-purple-600';
          break;
        default:
          icon = MessageCircle;
          bgColor = 'bg-gray-500';
          hoverColor = 'hover:bg-gray-600';
      }

      return {
        platform: link.platform,
        url: link.contactLink,
        icon,
        bgColor,
        hoverColor
      };
    });
  };

  // Get additional social media contacts
  const getSocialMediaContacts = () => {
    if (!contactInfo?.socialmediaContact) return [];
    
    return contactInfo.socialmediaContact.map(social => {
      const platform = social.socialMedia.toLowerCase();
      let icon, bgColor, hoverColor;
      
      switch (platform) {
        case 'whatsapp':
          icon = MessageCircle;
          bgColor = 'bg-green-500';
          hoverColor = 'hover:bg-green-600';
          break;
        case 'messenger':
        case 'facebook':
          icon = MessageCircle;
          bgColor = 'bg-blue-500';
          hoverColor = 'hover:bg-blue-600';
          break;
        case 'telegram':
          icon = MessageCircle;
          bgColor = 'bg-blue-400';
          hoverColor = 'hover:bg-blue-500';
          break;
        case 'instagram':
          icon = MessageCircle;
          bgColor = 'bg-pink-500';
          hoverColor = 'hover:bg-pink-600';
          break;
        default:
          icon = MessageCircle;
          bgColor = 'bg-gray-500';
          hoverColor = 'hover:bg-gray-600';
      }

      return {
        platform: social.socialMedia,
        url: social.socialmediaLink,
        icon,
        bgColor,
        hoverColor
      };
    });
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await apiService.addToCart(product._id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);

      // Meta Pixel AddToCart event
      if (window.fbq) {
        window.fbq('track', 'AddToCart', {
          content_ids: [product._id],
          content_type: 'product',
          value: pricing.finalPrice * quantity,
          currency: 'BDT'
        });
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setIsWishlisted(prev => !prev);
    // TODO: call wishlist API
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) setQuantity(q => q + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading product...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The product you're looking for doesn't exist."}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go Back
              </button>
              <Link
                to="/products"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pricing = getPricing();
  const isOutOfStock = product.stock === 0;
  const deliveryCharge = getDeliveryCharge();
  const socialLinks = getSocialLinks();
  const socialMediaContacts = getSocialMediaContacts();
  
  // Combine both social link sources
  const allSocialContacts = [...socialLinks, ...socialMediaContacts];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 text-xs md:text-sm hover:text-blue-600">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/products" className="text-gray-500 text-xs md:text-sm hover:text-blue-600">
              Products
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {product.category && (
              <>
                <span className="text-gray-500 text-xs md:text-sm">{product.category.name}</span>
                <ChevronRight className="w-4 h-4 text-sm md:text-base text-gray-400" />
              </>
            )}
            <span className="text-gray-900 font-medium text-xs md:text-sm truncate max-w-xs">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1  lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="flex flex-col  space-y-14">
            <div className="relative group w-full lg:w-[500px] h-full lg:h-[500px] bg-gray-50 rounded-2xl overflow-hidden">
              <img
                src={imageError ? "/placeholder-product.jpg" : images[currentImageIndex]}
                alt={product.title}
                className="w-full lg:w-[500px] h-full lg:h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
              {pricing.hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {pricing.discountPercentage}% OFF
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full ${
                        i === currentImageIndex ? "bg-white scale-125" : "bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      i === currentImageIndex
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${i + 1}`}
                      className="w-20 h-20 object-cover"
                      onError={e => (e.target.src = "/placeholder-product.jpg")}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl md:text-base lg:text-lg font-medium text-gray-900">{product.title}</h3>
              {product.companyName && (
                <p className="text-sm md:text-sm font-normal text-gray-600">{product.companyName}</p>
              )}
            </div>

            {/* CORRECTED PRICING DISPLAY */}
            <div>
              <div className="flex items-center space-x-4">
                <span className="text-xl font-bold text-gray-900">
                  ৳ {pricing.finalPrice.toFixed(2)}
                </span>
                {pricing.hasDiscount && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ৳ {pricing.sellingPrice.toFixed(2)}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-semibold">
                      Save ৳ {pricing.offerValue.toFixed(2)} ({pricing.discountPercentage}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Price inclusive of all taxes
              </p>
            </div>

            {/* Price Breakdown (Optional - for transparency) */}
            {pricing.hasDiscount && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-blue-900">Price Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">MRP:</span>
                    <span className="text-gray-900">৳ {pricing.sellingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600">-৳ {pricing.offerValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-blue-200">
                    <span className="text-gray-900">You Pay:</span>
                    <span className="text-gray-900">৳ {pricing.finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {product.stock > 0 ? (
                <div className="flex items-center text-green-600 space-x-2">
                  <Check className="w-5 h-5" />
                  <span>In Stock ({product.stock} available)</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Out of Stock</span>
                </div>
              )}
              {product.stock > 0 && product.stock <= 10 && (
                <p className="text-orange-600 text-sm font-medium">
                  ⚡ Only {product.stock} left - order soon!
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-y py-4 text-gray-600 text-sm">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-green-600" />
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-green-600" />
                <span>Quality Guarantee</span>
              </div>
            </div>

            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">Max: {product.stock}</span>
                </div>

                {/* Total Price Display */}
                {quantity > 1 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Item Total ({quantity} items):</span>
                      <span className="font-semibold text-gray-900">
                        ৳ {(pricing.finalPrice * quantity).toFixed(2)}
                      </span>
                    </div>
                    {pricing.hasDiscount && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Total Savings:</span>
                        <span className="font-semibold text-green-600">
                           {(pricing.offerValue * quantity).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || isOutOfStock}
                    className={`flex-1 flex items-center justify-center py-3 rounded-lg font-semibold transition ${
                      addedToCart
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } disabled:opacity-50`}
                  >
                    {addingToCart ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : addedToCart ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <ShoppingCart className="w-5 h-5" />
                    )}
                    <span className="ml-2">
                      {addingToCart
                        ? "Adding..."
                        : addedToCart
                        ? "Added to Cart!"
                        : "Add to Cart"}
                    </span>
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-lg border-2 transition ${
                      isWishlisted
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-300 hover:border-red-300"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Contact Information Section */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">For more information</h3>
                  </div>
                  
                  {contactLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="ml-2 text-blue-600">Loading contact options...</span>
                    </div>
                  ) : (
                    <>
                      {contactInfo?.email && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Mail className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{contactInfo.email}</span>
                        </div>
                      )}
                      
                      {contactInfo?.contactNumber && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Phone className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{contactInfo.contactNumber}</span>
                        </div>
                      )}

                      {allSocialContacts.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700 font-medium">Contact us directly:</p>
                          <div className="flex flex-wrap gap-2">
                            {allSocialContacts.map((social, index) => {
                              const Icon = social.icon;
                              return (
                                <a
                                  key={index}
                                  href={social.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium text-white text-sm transition-colors duration-200 ${social.bgColor} ${social.hoverColor}`}
                                >
                                  <Icon className="w-4 h-4 mr-1" />
                                  {social.platform}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {(!contactInfo || (allSocialContacts.length === 0 && !contactInfo.email && !contactInfo.contactNumber)) && (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm">Contact information will be available soon.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span>
                      <strong>Free delivery</strong> on orders over ৳500
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Order within <strong>2 hours</strong> for same-day delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>Delivering to <strong>{selectedCity === 'dhaka' ? 'Dhaka' : 'your location'}</strong></span>
                  </div>
                </div> */}
              </div>
            )}

            {product.specifications?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.specifications.slice(0, 3).map((s, i) => (
                    <li key={i} className="flex">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2"></span>
                      <span>
                        <strong>{s.title}:</strong> {s.details}
                      </span>
                    </li>
                  ))}
                  {product.specifications.length > 3 && (
                    <button
                      onClick={() => setSelectedTab("specifications")}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View all {product.specifications.length} specifications →
                    </button>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b">
            <nav className="flex space-x-8 text-sm overflow-x-auto">
              {[
                { id: "description", label: "Description" },
                { id: "specifications", label: "Specifications" },
                { id: "shipping", label: "Shipping & Returns" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium ${
                    selectedTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-sm lg:text-xl text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="py-8">
            {selectedTab === "description" && (
              <div className="prose max-w-none text-gray-700">
                <p>{product.description}</p>
              </div>
            )}

            {selectedTab === "specifications" && (
              <div>
                {product.specifications?.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {product.specifications.map((spec, i) => (
                      <div
                        key={i}
                        className="flex justify-between py-3 border-b"
                      >
                        <span className="font-medium text-gray-900 w-1/3">
                          {spec.title}
                        </span>
                        <span className="text-gray-600 text-right">
                          {spec.details}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No specifications available.</p>
                )}
              </div>
            )}

            {selectedTab === "shipping" && (
              <div className="space-y-6 text-gray-700">
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Shipping Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Inside Dhaka</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• Delivery Charge: ৳ 60</li>
                          <li>• Standard Delivery: 2-3 business days</li>
                          <li>• Express Delivery: Next day (additional charge)</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Outside Dhaka</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• Delivery Charge: ৳ 120</li>
                          <li>• Standard Delivery: 3-5 business days</li>
                          <li>• Express Delivery: 2-3 days (additional charge)</li>
                        </ul>
                      </div>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Delivery charges are calculated at checkout based on your shipping address.
                        Free delivery available on orders above ৳ 500.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Return Policy</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <p>• Returns accepted within 7 days of delivery</p>
                    <p>• Product must be unused and in original packaging</p>
                    <p>• Original invoice/receipt required</p>
                    <p>• Refund processed within 5-7 business days after inspection</p>
                    <p>• Contact our support team to initiate a return</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-lg">Warranty Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <p>Product comes with manufacturer's warranty. Please check product packaging for warranty details.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;