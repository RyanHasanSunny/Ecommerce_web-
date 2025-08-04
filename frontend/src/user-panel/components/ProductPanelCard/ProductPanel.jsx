import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./productcard/ProductCard";

const ProductPanel = ({ title, subtitle, apiEndpoint, children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const shouldFetchFromApi = apiEndpoint && !children;

  useEffect(() => {
    if (shouldFetchFromApi) {
      const fetchProducts = async () => {
        try {
          const res = await axios.get(apiEndpoint);
          setProducts(res.data.products || res.data);
        } catch (err) {
          console.error("Failed to fetch products:", err);
          setProducts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [apiEndpoint, shouldFetchFromApi]);

  const renderContent = () => {
    if (loading) return <p>Loading products...</p>;

    if (shouldFetchFromApi && products.length === 0)
      return <p className="text-gray-500 text-center">No products available.</p>;

    return shouldFetchFromApi
      ? products.map((product) => (
        <ProductCard
          key={product._id}
          thumbnail={product.thumbnail}
          title={product.title}
          sellingPrice={product.sellingPrice}
          offerPrice={product.offerPrice}
        />
      ))
      : children;
  };

  return (
    <div className="ProductPanel w-full text-black bg-white flex flex-col rounded-xl items-center justify-center" style={{ padding: "40px 0" }}>

      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-lg mb-6">{subtitle}</p>

      <div className="flex flex-wrap justify-center gap-6 max-w-7xl w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProductPanel;
