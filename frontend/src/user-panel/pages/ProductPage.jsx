import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../../user-panel/api/api";
import ServiceSection from "../components/Service/Services";
import { Helmet } from "react-helmet";
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
  Check
} from "lucide-react";

const ProductPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedTab, setSelectedTab] = useState('description');
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const fetchedProduct = await getProductById(productId);
                setProduct(fetchedProduct);
            } catch (err) {
                console.error("Error fetching product:", err);
            }
        };

        fetchProduct();
    }, [productId]);

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-lg font-medium text-gray-600">Loading product...</p>
            </div>
        );
    }

    const handleAddToCart = () => {
        console.log(`Added ${quantity} of ${product.title} to cart`);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const nextImage = () => {
        setCurrentImageIndex(prev => 
            prev === product.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex(prev => 
            prev === 0 ? product.images.length - 1 : prev - 1
        );
    };

    const toggleWishlist = () => {
        setIsWishlisted(!isWishlisted);
    };

    const calculateDiscount = () => {
        const discount = ((product.offerPrice - product.sellingPrice) / product.offerPrice) * 100;
        return Math.round(discount);
    };

    return (
        <>
            <Helmet>
                <title>{product.title} - Premium Quality Products</title>
                <meta name="description" content={product.description} />
                <meta property="og:title" content={product.title} />
                <meta property="og:description" content={product.description} />
                <meta property="og:image" content={product.images[0]} />
                <meta property="og:url" content={`http://localhost:8080/api/product/${productId}`} />
            </Helmet>

            <div className="min-h-screen bg-white">
                {/* Breadcrumb */}
                <div className="bg-gray-50 border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="text-sm">
                            <span className="text-gray-500">Home</span>
                            <span className="mx-2 text-gray-400">/</span>
                            <span className="text-gray-500">Products</span>
                            <span className="mx-2 text-gray-400">/</span>
                            <span className="text-gray-900 font-medium">{product.title}</span>
                        </nav>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="relative group bg-gray-50 rounded-2xl overflow-hidden">
                                <img
                                    src={product.images[currentImageIndex]}
                                    alt={product.title}
                                    className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                
                                {/* Discount Badge */}
                                {product.offerPrice > product.sellingPrice && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {calculateDiscount()}% OFF
                                    </div>
                                )}

                                {/* Image Navigation */}
                                {product.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail Images */}
                            {product.images.length > 1 && (
                                <div className="flex space-x-2 overflow-x-auto">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                                currentImageIndex === index 
                                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.title} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Information */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                    {product.title}
                                </h1>
                                
                                {/* Rating */}
                                <div className="flex items-center mt-2 space-x-2">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-gray-600">(4.8)</span>
                                    <span className="text-blue-600 hover:underline cursor-pointer">267 reviews</span>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="flex items-center space-x-4">
                                <span className="text-3xl font-bold text-gray-900">
                                    ${product.sellingPrice}
                                </span>
                                {product.offerPrice > product.sellingPrice && (
                                    <>
                                        <span className="text-xl text-gray-500 line-through">
                                            ${product.offerPrice}
                                        </span>
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-medium">
                                            Save ${(product.offerPrice - product.sellingPrice).toFixed(2)}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Product Benefits */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Truck className="w-4 h-4 text-green-600" />
                                    <span>Free Shipping</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <span>Secure Payment</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <RotateCcw className="w-4 h-4 text-green-600" />
                                    <span>Easy Returns</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Award className="w-4 h-4 text-green-600" />
                                    <span>Quality Guarantee</span>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-700 font-medium">Quantity:</span>
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={decrementQuantity}
                                            className="p-2 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={incrementQuantity}
                                            className="p-2 hover:bg-gray-100 transition-colors duration-200"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                                            addedToCart
                                                ? 'bg-green-600 text-white'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {addedToCart ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                <span>Added to Cart!</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5" />
                                                <span>Add to Cart</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={toggleWishlist}
                                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                            isWishlisted
                                                ? 'border-red-500 bg-red-50 text-red-600'
                                                : 'border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                    </button>
                                    
                                    <button className="p-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Key Specifications Preview */}
                            {product.specifications && product.specifications.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                                    <div className="space-y-2">
                                        {product.specifications.slice(0, 3).map((spec, idx) => (
                                            <div key={idx} className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                <span className="text-sm text-gray-700">
                                                    <strong>{spec.title}:</strong> {spec.details}
                                                </span>
                                            </div>
                                        ))}
                                        {product.specifications.length > 3 && (
                                            <button className="text-blue-600 text-sm hover:underline">
                                                View all specifications
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Details Tabs */}
                    <div className="mt-16">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8">
                                {['description', 'specifications', 'reviews'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setSelectedTab(tab)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200 ${
                                            selectedTab === tab
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="py-8">
                            {selectedTab === 'description' && (
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-gray-700 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {selectedTab === 'specifications' && product.specifications && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {product.specifications.map((spec, idx) => (
                                        <div key={idx} className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="font-medium text-gray-900">{spec.title}</span>
                                            <span className="text-gray-600">{spec.details}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedTab === 'reviews' && (
                                <div className="space-y-6">
                                    <div className="text-center py-12">
                                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
                                        <p className="text-gray-600">Be the first to review this product!</p>
                                        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                            Write a Review
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Services */}
                    <div className="mt-16">
                        <ServiceSection 
                            title="Related Services" 
                            subtitle="Explore our services related to this product" 
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductPage;