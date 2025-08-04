import React from "react";
import Header from "../../user-panel/components/header/Header";
import Heropanel from "../../user-panel/Sections/Heropanel/Heropanel";
import ProductPanel from "../../user-panel/components/ProductPanelCard/ProductPanel";
import ProductCard from "../components/ProductPanelCard/productcard/ProductCard";

export const HomePage = () => {
    return (
        <div className="home-page flex flex-col items-center justify-top min-w-screen min-h-screen bg-gray-100">
            <Header />
            <Heropanel />
            <ProductPanel
                title="New Arrivals"
                subtitle="Check out the latest products"
                apiEndpoint="http://localhost:5000/api/products/arrivals"
            />
                



        </div>
    );
}