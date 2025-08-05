import React, { useState } from "react";
import { ShoppingCart, Search, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
    const { isAuthenticated, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header flex flex-col bg-[#fff]">
            <div className="topbar flex items-center justify-between items-center px-8 border-b border-gray-200 text-black">
                <div className="logo">
                    <h1 className="text-2xl font-bold">MAGIC MART</h1>
                </div>

                <nav className="flex items-center gap-6">
                    <ul className="flex space-x-6 text-sm font-medium">
                        <li><a href="/">Home</a></li>
                        <li><a href="/deals">Deals</a></li>
                        <li><a href="/new">New Arrivals</a></li>
                    </ul>
                    <div className="flex items-center gap-4">
                        <Search className="w-5 h-5 cursor-pointer" />
                        <ShoppingCart className="w-5 h-5 cursor-pointer" />
                        
                        {isAuthenticated() ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                </button>
                                
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <a 
                                            href="/profile" 
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Profile Settings
                                        </a>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                                    <a href="/login">Login</a>
                                </button>
                                <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                                    <a href="/signup">Register</a>
                                </button>
                            </>
                        )}
                    </div>
                </nav>
            </div>
            <div className="bottombar flex items-center justify-center py-4 px-8 text-black">
                <ul className="catagorylist flex space-x-6 text-sm font-medium">
                    <li><a href="/">Elecronics</a></li>
                    <li><a href="/">Fashion</a></li>
                    <li><a href="/">Home</a></li>
                    <li><a href="/">Beauty</a></li>
                    <li><a href="/">Sports</a></li>
                    <li><a href="/">Toys</a></li>
                    <li><a href="/">Books</a></li>
                </ul>
            </div>
        </header>
    );
};

export default Header;
