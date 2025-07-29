import React from 'react';
import { FaBoxOpen, FaClipboardList, FaTags, FaUsers, FaChartBar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const menuItems = [
  { name: "Orders", icon: <FaClipboardList />, path: "/admin/dashboard/orders" },
  { name: "Products", icon: <FaBoxOpen />, path: "/admin/dashboard/products" },
  { name: "Categories", icon: <FaTags />, path: "/admin/dashboard/categories" },
  { name: "Customers", icon: <FaUsers />, path: "/admin/dashboard/customers" },
  { name: "Reports", icon: <FaChartBar />, path: "/admin/dashboard/reports" },
  { name: "Add Product", icon: <FaBoxOpen />, path: "/admin/dashboard/products/add" },
];

const LeftMenu = ({ onMenuItemClick }) => {
  return (
    <aside className="w-64 text-white flex flex-col shadow-lg" style={{ backgroundColor: "#061a3fff", height: "100%" }}>
      <nav className="flex-1 py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path} // Use Link for navigation
                onClick={() => onMenuItemClick(item.name)} // Call the function passed as prop
                className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors rounded-md cursor-pointer"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default LeftMenu;
