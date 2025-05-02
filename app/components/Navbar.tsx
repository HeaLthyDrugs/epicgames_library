"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
        setIsDropdownOpen(false); // Close dropdown when scrolling down
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [lastScrollY]);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleToggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleToggleDropdown();
    }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-transform duration-300 bg-[#121212] border-b border-[#202020] ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-full px-6 lg:pt-3 pb-3">
        <div className="flex items-center h-[52px]">
          {/* Logo and chevron */}
          <div className="flex items-center mr-4 relative" ref={dropdownRef}>
            <div 
              className="flex items-center cursor-pointer"
              onClick={handleToggleDropdown}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              aria-label="Epic Games Menu"
              aria-expanded={isDropdownOpen}
              role="button"
            >
              <div className="relative w-10 h-10 text-white">
                <Image 
                  src="/logo/logo-white.svg"
                  alt="Epic Games Logo"
                  fill
                  className="object-contain [&>*]:fill-white"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3"
                className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Epic Games Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-[52px] left-0 w-[280px] bg-[#202020]/90 backdrop-blur-md rounded-b-md shadow-lg overflow-hidden z-50">
                <div className="p-4 border-b border-[#393939]">
                  <div className="relative w-10 h-10 mx-auto mb-2">
                    <Image 
                      src="/logo/logo-white.svg"
                      alt="Epic Games Logo"
                      fill
                      className="object-contain"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  </div>
                  <h3 className="text-center text-white text-sm font-medium mb-1">Epic Games</h3>
                  <p className="text-center text-gray-400 text-xs">Everything Epic in one place</p>
                </div>
                
                <div className="p-4">
                  <div className="mb-6">
                    <h4 className="text-gray-400 text-xs font-medium uppercase mb-2">Play</h4>
                    <ul className="space-y-3">
                      <li>
                        <Link href="/store" className="flex items-center text-white hover:text-gray-300 text-sm">
                          <span className="w-5 h-5 mr-3 flex items-center justify-center">
                            <Image src="/Store.svg" alt="Store" width={22} height={14} />
                          </span>
                          Store
                        </Link>
                      </li>
                      <li>
                        <Link href="/library" className="flex items-center text-white hover:text-gray-300 text-sm">
                          <span className="w-5 h-5 mr-3 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <line x1="9" y1="3" x2="9" y2="21" />
                            </svg>
                          </span>
                          Library
                        </Link>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-gray-400 text-xs font-medium uppercase mb-2">Create</h4>
                    <ul className="space-y-3">
                      <li>
                        <Link href="" className="flex items-center text-white hover:text-gray-300 text-sm">
                          <span className="w-5 h-5 mr-3 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 2 7 12 12 22 7 12 2" />
                              <polyline points="2 17 12 22 22 17" />
                              <polyline points="2 12 12 17 22 12" />
                            </svg>
                          </span>
                          Unreal Engine
                        </Link>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-gray-400 text-xs font-medium uppercase mb-2">Discover</h4>
                    <ul className="space-y-3">
                      <li>
                        <Link href="/communities" className="flex items-center text-white hover:text-gray-300 text-sm">
                          <span className="w-5 h-5 mr-3 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 16c2 0 4-1 4-3.5C16 10 12 8 12 8s-4 2-4 4.5c0 2.5 2 3.5 4 3.5z" />
                            </svg>
                          </span>
                          Communities
                        </Link>
                      </li>
                      <li>
                        <Link href="/news" className="flex items-center text-white hover:text-gray-300 text-sm">
                          <span className="w-5 h-5 mr-3 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
                              <path d="M8 10h8" />
                              <path d="M8 14h4" />
                            </svg>
                          </span>
                          News
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STORE text */}
          <div className="mx-6">
            <Link href="/" className="group block cursor-pointer" aria-label="Go to store">
              <div className="w-[54px] h-[30px] transition-all duration-300 group-hover:opacity-70 group-hover:transform group-hover:scale-105">
                <Image
                  src="/Store.svg"
                  alt="STORE"
                  width={54}
                  height={30}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/support" 
              className="text-white hover:text-gray-300 text-[15px] font-normal font-roboto"
              tabIndex={0}
              aria-label="Support"
            >
              Support
            </Link>
            <Link 
              href="/library" 
              className="text-white hover:text-gray-300 text-[15px] font-normal font-roboto"
              tabIndex={0}
              aria-label="Library"
            >
              Library
            </Link>
            <div className="relative group">
              <Link 
                href="/distribute" 
                className="text-white hover:text-gray-300 flex items-center text-[15px] font-normal font-roboto"
                tabIndex={0}
                aria-label="Distribute"
              >
                Distribute
                <svg className="ml-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </Link>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center ml-auto space-x-5">
            <button 
              className="text-white p-2"
              tabIndex={0}
              aria-label="Language selector"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </button>
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={handleToggleProfileDropdown}
                className="text-white bg-[#2a2a2a] rounded-full w-8 h-8 flex items-center justify-center"
                tabIndex={0}
                aria-label="User profile"
              >
                <span className="font-medium text-sm font-roboto">P</span>
              </button>
              {isProfileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-[#202020]/90 backdrop-blur-md rounded-lg shadow-lg py-2 z-50 transition-transform transform origin-top scale-100"
                >
                  <ul className="text-white text-sm">
                    <li className="px-4 py-2 hover:bg-[#393939] cursor-pointer">My Achievements</li>
                    <li className="px-4 py-2 hover:bg-[#393939] cursor-pointer">Epic Rewards</li>
                    <li className="px-4 py-2 hover:bg-[#393939] cursor-pointer">Epic Wallet</li>
                    <li className="px-4 py-2 hover:bg-[#393939] cursor-pointer">Coupons</li>
                    <li className="px-4 py-2 hover:bg-[#393939] cursor-pointer">Account</li>
                    <li className="px-4 py-2 hover:bg-[#393939] cursor-pointer">Redeem Code</li>
                    <li className="px-4 py-2 hover:bg-[#393939] cursor-pointer">
                      <Link href="/library" className="block w-full text-left">
                        Library
                      </Link>
                    </li>
                    <li className="px-4 py-2 hover:bg-[#393939] cursor-pointer">Wishlist</li>
                    <li className="px-4 py-2 hover:bg-[#393939] cursor-pointer">Sign Out</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="ml-1">
              <span className="text-white text-[14px] font-normal font-roboto">Pudinaslurry</span>
            </div>
            <button 
              className="bg-[#0074e4] hover:bg-[#0074e4]/90 text-white px-5 py-[7px] rounded text-[14px] font-medium font-roboto"
              tabIndex={0}
              aria-label="Download"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;