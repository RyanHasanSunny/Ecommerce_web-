import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../../user-panel/api/api"; // Ensure you have this API function
import ServiceSection from "../components/Service/Services";
import { Helmet } from "react-helmet"; // For SEO purposes

const ProductPage = () => {
    const { productId } = useParams(); // Get the product ID from URL params
    const [product, setProduct] = useState(null); // Store the product data
    const [quantity, setQuantity] = useState(1); // Store the quantity for cart

    // Fetch product details using the product ID
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const fetchedProduct = await getProductById(productId); // Fetch product by ID
                setProduct(fetchedProduct);
            } catch (err) {
                console.error("Error fetching product:", err);
            }
        };

        fetchProduct();
    }, [productId]);

    if (!product) {
        return (
            <div className="flex items-center justify-center w-full h-64">
                <p className="text-lg font-semibold text-gray-600">Loading products...</p>
            </div>
        );
    }

    const handleAddToCart = () => {
        // Logic for adding the product to the cart
        console.log(`Added ${quantity} of ${product.title} to cart`);
        // You can add cart logic here or call an API
    };

    const incrementQuantity = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };

    return (
           <>
      <Helmet>
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.images[0]} />
        <meta property="og:url" content={`https://your-site.com/product/${product.id}`} />
      </Helmet>

        <div className="flex flex-col items-center mt-10 gap-8 min-h-screen px-6">
            <div className="max-w-screen-lg w-full">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Side: Product Images */}
                    <div className="md:w-1/2">
                        <div className="text-center">
                            <img
                                src={product.images[0]} // Display the first image
                                alt={product.title}
                                className="max-w-[400px] h-[400px] object-cover rounded-lg bg-gray-200 mx-auto"
                            />
                            {/* Add logic to switch images */}
                        </div>
                    </div>

                    {/* Right Side: Product Details */}
                    <div className="md:w-1/2 flex flex-col items-start">
                        <h2 className="text-3xl font-bold">{product.title}</h2>
                        <div className="mt-4 flex flex-col items-start">
                        <h4 className="text-lg text-gray-500 line-through">${product.offerPrice}</h4>
                        <h3 className="text-2xl text-blue-600 font-bold">${product.sellingPrice}</h3>
                        </div>

                        {/* Product Specifications */}
                        <div className="mt-6">
                            <h4 className="text-xl font-semibold">Specifications:</h4>
                            <ul className="mt-2">
                                {product.specifications.map((spec, idx) => (
                                    <li key={idx} className="text-sm mt-1">
                                        <strong>{spec.title}:</strong> {spec.details}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quantity Control */}
                        <div className="mt-6 flex items-center gap-4">
                            <h4 className="text-lg font-semibold">Quantity:</h4>
                            <button
                                onClick={decrementQuantity}
                                className="bg-gray-300 text-xl p-2 rounded-full hover:bg-gray-400"
                            >
                                -
                            </button>
                            <span className="text-lg font-semibold">{quantity}</span>
                            <button
                                onClick={incrementQuantity}
                                className="bg-gray-300 text-xl p-2 rounded-full hover:bg-gray-400"
                            >
                                +
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <div className="mt-6">
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
                {/* Product Description */}
                <div className="mt-12">
                    <h3 className="text-2xl font-semibold">Product Details</h3>
                    <div className="mt-4 border-t border-gray-300 pt-4">
                        <p className="text-lg">{product.description}</p>
                        {product.specifications.map((spec, idx) => (
                            <li key={idx} className="text-sm mt-1">
                                <strong>{spec.title}:</strong> {spec.details}
                            </li>
                        ))}
                    </div>
                </div>
                 <ServiceSection title="Related Services" subtitle="Explore our services related to this product" />
            </div>
        </div>
        </>
    );
};

export default ProductPage;
