import React from "react";
import { ShoppingCart, Search, User } from "lucide-react";

export const Header = () => {
    return (
        <header className="header flex flex-col w-100vw  bg-[#fff]" >
            <div className="topbar flex items-center justify-between items-center py-4 px-8 border-b border-gray-200  text-black">
                <div className="logo">
                    {/* <img src="/path/to/logo.png" alt="Logo" className="h-8" /> */}
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
                        <User className="w-5 h-5 cursor-pointer" />
                        <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                            <a href="/login">Login</a>
                        </button>
                        <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                            <a href="/register">Register</a>
                        </button>
                    </div>
                </nav>
            </div>
            <div className="bottombar flex  items-center justify-center py-4 px-8  text-black ">
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
