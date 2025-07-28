import React from 'react';
import MainContainer from '../admincomponents/container/MainContainer'; // Adjust the path as needed
import ProductManagement from '../pages/ProductManagement'; // Adjust the path as needed

const ProductAdd = () => {
  return (
    <MainContainer
      title="Add New Product"
      breadcrumbs={[
      
        { label: 'Add Product' }
      ]}
    >
      <ProductManagement />
    </MainContainer>
  );
};

export default ProductAdd;
