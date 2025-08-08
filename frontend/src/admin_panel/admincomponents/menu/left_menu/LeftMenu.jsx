import React from 'react';
import { FaBoxOpen, FaClipboardList, FaTags, FaUsers, FaChartBar, FaCog } from 'react-icons/fa';

const menuItems = [
  { name: "Dashboard", icon: <FaClipboardList />, path: "/admin/dashboard" },
  { name: "Orders", icon: <FaClipboardList />, path: "/admin/orders" },
  { name: "Sales", icon: <FaChartBar />, path: "/admin/sales" },
  { name: "Products", icon: <FaBoxOpen />, path: "/admin/products" },
  { name: "Categories", icon: <FaTags />, path: "/admin/categories" },
  { name: "Customers", icon: <FaUsers />, path: "/admin/customers" },
  { name: "Reports", icon: <FaChartBar />, path: "/admin/reports" },
  {name: "Settings", icon: <FaCog />, path: "/admin/settings" }
];

const LeftMenu = ({ onMenuItemClick }) => {
  return (
    <aside className="w-64 text-white flex flex-col shadow-lg" style={{ backgroundColor: "#061a3fff", height: "100%" }}>
      <nav className="flex-1 py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <a
                onClick={() => onMenuItemClick(item.name, item.path)} // Pass both name and path
                className="flex items-center gap-3 px-6 py-3 hover:bg-gray-800 transition-colors rounded-md cursor-pointer"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default LeftMenu;
