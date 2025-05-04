"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRawgApi, Game } from "../services/rawg-api";
import { useRouter } from "next/navigation";

const SubNavbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 52);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    const searchGames = async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const rawgApi = getRawgApi();
          const results = await rawgApi.searchGames(searchQuery);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error("Error searching games:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };
    
    const debounceTimeout = setTimeout(searchGames, 300);
    
    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [searchQuery]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim().length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };
  
  const handleGameClick = (slug: string) => {
    router.push(`/game/${slug}`);
    setShowResults(false);
    setSearchQuery("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleGameClick(searchResults[0].slug);
    }
    if (e.key === "Escape") {
      setShowResults(false);
    }
  };
  
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
            <div className="relative" ref={searchRef}>
              <input
                ref={inputRef}
                type="search"
                placeholder="Search store"
                className="bg-[#202020] text-white px-3 py-1 pl-10 rounded-3xl text-[14px] w-[250px] h-[38px] font-roboto"
                aria-label="Search store"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim().length > 0 && setShowResults(true)}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              
              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 mt-2 w-[350px] max-h-[400px] overflow-y-auto bg-[#202020] rounded-lg shadow-lg z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-300">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((game) => (
                        <div 
                          key={game.id} 
                          className="flex items-center px-4 py-3 hover:bg-[#303030] cursor-pointer"
                          onClick={() => handleGameClick(game.slug)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleGameClick(game.slug);
                            }
                          }}
                          aria-label={`${game.name} - Click to view details`}
                        >
                          <div className="flex-shrink-0 w-[60px] h-[60px] relative rounded overflow-hidden">
                            <Image
                              src={game.background_image || "https://placehold.co/60x60/121212/cccccc?text=No+Image"}
                              alt={game.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="text-white text-[14px] font-medium">{game.name}</p>
                            {game.released && (
                              <p className="text-gray-400 text-[12px]">
                                {new Date(game.released).getFullYear()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim() !== "" ? (
                    <div className="p-4 text-center text-gray-300">
                      No games found
                    </div>
                  ) : null}
                </div>
              )}
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