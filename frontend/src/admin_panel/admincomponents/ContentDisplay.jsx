import React from 'react';
import StatsCard from './cards/StatsCard';
import ProductList from '../pages/ProductList';
import ProductAdd from '../pages/ProductAdd';
import OrderList from '../pages/OrderList';

const ContentDisplay = ({ selectedMenu, stats }) => {
  switch (selectedMenu) {
    case 'Orders':
      return <OrderList />;
    case 'Products':
      return <ProductList />;
    case 'Add Product':
      return <ProductAdd />;
    case 'Categories':
      // existing category list markup
      return (
        <div>/* category management UI here */</div>
      );
    default:
      return (
        <div className="grid grid-cols-3 gap-4">
          <StatsCard title="Total Products" value={stats.totalProducts} />
          <StatsCard title="Total Sold" value={stats.totalSold} />
          <StatsCard title="Total Searches" value={stats.totalSearches} />
        </div>
      );
  }
};

export default ContentDisplay;