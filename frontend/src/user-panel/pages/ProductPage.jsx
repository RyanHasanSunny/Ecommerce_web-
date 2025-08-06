// src/user-panel/pages/ProductPage.jsx

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
  MapPin
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const fetched = await apiService.getProductById(productId);
        setProduct(fetched);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

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

  const calculateDiscount = () => {
    if (product.offerPrice && product.offerPrice < product.sellingPrice) {
      return Math.round(
        ((product.sellingPrice - product.offerPrice) / product.sellingPrice) * 100
      );
    }
    return 0;
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
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading product...</p>
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

  const finalPrice = product.offerPrice || product.sellingPrice;
  const discount = calculateDiscount();
  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/products" className="text-gray-500 hover:text-blue-600">
              Products
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {product.category && (
              <>
                <span className="text-gray-500">{product.category.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </>
            )}
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative group bg-gray-50 rounded-2xl overflow-hidden">
              <img
                src={imageError ? "/placeholder-product.jpg" : images[currentImageIndex]}
                alt={product.title}
                className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {discount}% OFF
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
              <div className="flex space-x-2 overflow-x-auto">
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
                      className="w-full h-full object-cover"
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
              <h1 className="text-3xl font-bold">{product.title}</h1>
              {product.companyName && (
                <p className="text-lg text-gray-600">{product.companyName}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">(4.8)</span>
                <span className="text-blue-600 hover:underline cursor-pointer">267 reviews</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold">${finalPrice}</span>
                {discount > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.sellingPrice}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-semibold">
                      Save ${(product.sellingPrice - finalPrice).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              {discount > 0 && (
                <p className="text-green-600">
                  🎉 You save ${(product.sellingPrice - finalPrice).toFixed(2)} ({discount}% off)!
                </p>
              )}
            </div>

            <div className="space-y-2">
              {product.stock > 0 ? (
                <div className="flex items-center text-green-600 space-x-2">
                  <Check className="w-5 h-5" />
                  <span>In Stock ({product.stock})</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Out of Stock</span>
                </div>
              )}
              {product.stock > 0 && product.stock <= 10 && (
                <p className="text-orange-600 text-sm">
                  ⚡ Only {product.stock} left - order soon!
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-y py-4 text-gray-600 text-sm">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-green-600" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure Payment</span>
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
                        ? "Added!"
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
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span>
                      <strong>Free delivery</strong> on orders over $50
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Order within <strong>2 hours</strong> for same-day delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>Delivering to <strong>your location</strong></span>
                  </div>
                </div>
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
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                { id: "description", label: "Description" },
                { id: "specifications", label: "Specifications" },
                { id: "reviews", label: `Reviews (${product.reviews?.length || 0})` },
                { id: "shipping", label: "Shipping & Returns" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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

            {selectedTab === "reviews" && (
              <div className="space-y-6">
                {product.reviews?.length > 0 ? (
                  product.reviews.map((rev, i) => (
                    <div key={i} className="border-b pb-4 last:border-none">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-4 h-4 ${
                              starIdx < rev.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {rev.rating}.0
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700">{rev.comment}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(rev.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No reviews yet.</p>
                )}
              </div>
            )}

            {selectedTab === "shipping" && (
              <div className="space-y-6 text-gray-700 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Shipping</h4>
                  <p>
                    Free standard shipping on orders over $50. Orders
                    processed within 1–2 business days; delivery in 5–7 days.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Returns</h4>
                  <p>
                    Returns accepted within 30 days. Item must be unused and in
                    original packaging. Contact support to initiate.
                  </p>
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
