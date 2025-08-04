import React from "react";

import Heropanel from "../../user-panel/Sections/Heropanel/Heropanel";
import ProductPanel from "../../user-panel/components/ProductPanelCard/ProductPanel";
import ServiceSection from "../../user-panel/components/Service/Services";
import ReviewSection from "../../user-panel/components/Review/Review";


export const HomePage = () => {
    return (
        <div className="home-page flex flex-col justify-center gap-40 min-h-screen " style={{ width: "100%" }}>
          
            <Heropanel />
            <ProductPanel
                title="Offer Products"
                subtitle="Check out the latest offers"
                apiEndpoint="http://18.212.65.1:5000/api/products"
            />
            <ProductPanel
                title="New Arrivals"
                subtitle="Check out the latest products"
                apiEndpoint="http://18.212.65.1:5000/api/products"
            />

            <ServiceSection />
            <ReviewSection />


                



        </div>
    );
}