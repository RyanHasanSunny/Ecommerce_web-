import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate for navigation
import { getProducts } from "../../api/api";
import ProductCard from "./productcard/ProductCard";

const ProductPanel = ({ title, subtitle }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  // Initialize navigate function

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);  // Navigate to ProductPage with the productId
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <p className="text-lg font-semibold text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="ProductPanel w-full text-black bg-white flex flex-col rounded-xl items-center justify-center" style={{ padding: "40px 0" }}>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-lg mb-6">{subtitle}</p>

      <div className="flex flex-wrap justify-center gap-6 max-w-7xl w-full">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center">No products available.</p>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product._id}
              thumbnail={product.thumbnail}
              title={product.title}
              sellingPrice={product.sellingPrice}
              offerPrice={product.offerPrice}
              onClick={() => handleProductClick(product._id)}  // On click, navigate to ProductPage
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductPanel;
