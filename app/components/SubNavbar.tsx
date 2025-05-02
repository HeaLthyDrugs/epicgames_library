"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SubNavbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 52);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  return (
    <div 
      className={`w-full bg-[#121212] z-40 ${
        isSticky ? "sticky top-0 shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center h-[52px] overflow-x-auto no-scrollbar">
          {/* Search bar - Left side */}
          <div className="flex items-center mr-8">
            <div className="relative">
              <input
                type="search"
                placeholder="Search store"
                className="bg-[#202020] text-white px-3 py-1 pl-10 rounded-3xl text-[14px] w-[250px] h-[38px] font-roboto"
                aria-label="Search store"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Navigation links - Center */}
          <div className="flex items-center space-x-6 text-sm">
            <Link 
              href="/discover" 
              className="text-white hover:text-gray-300 whitespace-nowrap text-[14px] font-roboto font-normal"
              tabIndex={0}
              aria-label="Discover"
            >
              Discover
            </Link>
            <Link 
              href="/browse" 
              className="text-white hover:text-gray-300 whitespace-nowrap text-[14px] font-roboto font-normal"
              tabIndex={0}
              aria-label="Browse"
            >
              Browse
            </Link>
            <Link 
              href="/news" 
              className="text-white hover:text-gray-300 whitespace-nowrap text-[14px] font-roboto font-normal"
              tabIndex={0}
              aria-label="News"
            >
              News
            </Link>
          </div>
          
          {/* Right side links */}
          <div className="ml-auto flex items-center space-x-6">
            <Link 
              href="/wishlist" 
              className="text-white hover:text-gray-300 text-[14px] font-roboto font-normal"
              tabIndex={0}
              aria-label="Wishlist"
            >
              Wishlist
            </Link>
            <Link 
              href="/cart" 
              className="text-white hover:text-gray-300 text-[14px] font-roboto font-normal"
              tabIndex={0}
              aria-label="Cart"
            >
              Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubNavbar; 