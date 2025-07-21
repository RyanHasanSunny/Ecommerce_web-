import React from "react";
import { FaBoxOpen, FaClipboardList, FaTags, FaUsers, FaChartBar } from "react-icons/fa";

const menuItems = [
  { name: "Orders", icon: <FaClipboardList />, path: "/admin/orders" },
  { name: "Products", icon: <FaBoxOpen />, path: "/admin/products" },
  { name: "Categories", icon: <FaTags />, path: "/admin/categories" },
  { name: "Customers", icon: <FaUsers />, path: "/admin/customers" },
  { name: "Reports", icon: <FaChartBar />, path: "/admin/reports" },
];

const LeftMenu = () => {
  return (
    <aside className=" w-64 text-white flex flex-col shadow-lg" style={{ backgroundColor: "#1a202c", height: "100%" }}>
      <nav className="flex-1 py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.path}
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