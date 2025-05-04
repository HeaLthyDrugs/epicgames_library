"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRawgApi, Game } from "../services/rawg-api";
import { useLibrary } from "../context/LibraryContext";
import PurchaseModal from "./PurchaseModal";

type CarouselItem = {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isFree?: boolean;
};

const Carousel = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const ANIMATION_DURATION = 10000; // 10 seconds
  const UPDATE_INTERVAL = 100; // Update progress every 100ms for smooth animation
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { isGameInLibrary } = useLibrary();
  const [wishlistedGames, setWishlistedGames] = useState<number[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState<number | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const rawgApi = getRawgApi();
      
      // Get newer popular games (released in last 2 years, sorted by popularity)
      const currentYear = new Date().getFullYear();
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(currentYear - 2);
      
      const fromDate = twoYearsAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const toDate = new Date().toISOString().split('T')[0];
      
      // Custom fetch for modern popular games
      const data = await fetch(
        `https://api.rawg.io/api/games?key=74141a61b1f2487d95045f4a9816c421&dates=${fromDate},${toDate}&ordering=-added&page_size=6`
      );
      const response = await data.json();
      
      // Use popular modern games like Palworld, Baldur's Gate 3, etc. if API doesn't return good results
      const modernGames = response.results.length > 0 
        ? response.results 
        : await rawgApi.getTopRatedGames(6);
        
      setGames(modernGames);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching games:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleNext = useCallback(() => {
    if (games.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % games.length);
  }, [games.length]);

  const startProgressTimer = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    setProgress(0);
    
    const stepSize = (UPDATE_INTERVAL / ANIMATION_DURATION) * 100;
    
    progressInterval.current = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + stepSize;
        
        if (newProgress >= 100) {
          handleNext();
          return 0;
        }
        
        return newProgress;
      });
    }, UPDATE_INTERVAL);
  }, [UPDATE_INTERVAL, ANIMATION_DURATION, handleNext]);

  useEffect(() => {
    if (games.length > 0) {
      startProgressTimer();
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentSlide, startProgressTimer, games.length]);

  const handlePrev = () => {
    if (games.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + games.length) % games.length);
  };

  const handleTileClick = (index: number) => {
    setCurrentSlide(index);
  };

  const handleBuyGame = () => {
    if (games.length === 0 || !currentGame) return;
    setShowPurchaseModal(true);
  };

  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
  };

  const isGameInWishlist = (gameId: number) => {
    return wishlistedGames.includes(gameId);
  };

  const handleWishlistToggle = (gameId: number) => {
    setIsWishlistLoading(gameId);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setWishlistedGames(prev => {
        if (prev.includes(gameId)) {
          return prev.filter(id => id !== gameId);
        } else {
          return [...prev, gameId];
        }
      });
      setIsWishlistLoading(null);
    }, 800);
  };

  if (loading) {
    return (
      <div className="bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-white">Loading games...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-white">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-white">No games found.</div>
          </div>
        </div>
      </div>
    );
  }

  const currentGame = games[currentSlide];

  return (
    <div className="bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[600px] flex">
          {/* Main carousel section (left side) */}
          <div className="flex-1 py-6 pr-6">
            <div className="relative h-full w-full rounded-2xl overflow-hidden">
              {/* Current slide */}
              <div className="absolute inset-0 z-0">
                <Image 
                  src={currentGame.background_image || "https://placehold.co/1200x600/121212/cccccc?text=No+Image"} 
                  alt={currentGame.name}
                  fill
                  className="object-cover rounded-2xl"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10"></div>
              </div>
              
              {/* Game info */}
              <div className="absolute z-20 flex flex-col justify-end h-full w-full px-6 lg:px-8 pb-16">
                <div className="max-w-[600px]">
                  <div className="flex items-center gap-2">
                    {/* {currentGame.metacritic && (
                      <>
                        <span className={`text-sm px-2 py-1 rounded ${
                          currentGame.metacritic >= 80 ? "bg-green-700" : 
                          currentGame.metacritic >= 60 ? "bg-yellow-600" : "bg-red-700"
                        }`}>
                          {currentGame.metacritic}
                        </span>
                        <span className="text-[14px] uppercase tracking-wider font-medium text-white">Metacritic</span>
                      </>
                    )} */}
                    
                    {/* New Release badge
                    {currentGame.released && new Date(currentGame.released).getFullYear() >= 2023 && (
                      <span className="text-sm px-2 py-1 bg-blue-600 rounded ml-2">
                        NEW RELEASE
                      </span>
                    )} */}
                    <h2 className=" text-[12px] font-bold text-white py-1 rounded tracking-wider">NEW RELEASE</h2>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-wider">{currentGame.name}</h2>
                  
                  {/* Release date and genres */}
                  {/* <div className="flex items-center mb-3">
                    {currentGame.released && (
                      <span className="text-sm text-gray-300 mr-4">Released: {new Date(currentGame.released).toLocaleDateString()}</span>
                    )}
                    {currentGame.genres && currentGame.genres.length > 0 && (
                      <div className="flex flex-wrap">
                        {currentGame.genres.slice(0, 3).map((genre, index) => (
                          <span key={genre.id} className="text-sm text-gray-300 mr-2">
                            {genre.name}{index < Math.min(currentGame.genres?.length || 0, 3) - 1 ? "," : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div> */}
                  
                  {/* Description - Using a placeholder since RAWG API doesn't return full descriptions in the games list */}
                  <p className="text-base text-white mb-6 max-w-md font-light">
                    {currentGame.description_raw 
                      ? currentGame.description_raw.slice(0, 200) + '...'
                      : `Experience ${currentGame.name}, a captivating game that will draw you into its world.`
                    }
                  </p>

                  <div className="mb-2 font-medium text-white text-[14px] mx-2">
                    {/* price and discount or free */}
                      <span>
                        $20
                      </span>
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex items-center space-x-4">
                    <Link 
                      href={`/game/${currentGame.slug}`} 
                      className="bg-white hover:bg-gray-200 text-black px-14 py-4 rounded-xl text-[14px] font-regular"
                      tabIndex={0}
                      aria-label={`View ${currentGame.name}`}
                    >
                      Buy Now
                    </Link>
                    <button 
                      className="bg-transparent text-white hover:bg-white/10 px-6 py-4 rounded-xl flex items-center cursor-pointer"
                      onClick={() => handleWishlistToggle(currentGame.id)}
                      disabled={isWishlistLoading === currentGame.id}
                      tabIndex={0}
                      aria-label={isGameInWishlist(currentGame.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      {isWishlistLoading === currentGame.id ? (
                        <div className="animate-spin mr-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" fill="none" strokeWidth="4"></circle>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"></path>
                          </svg>
                        </div>
                      ) : isGameInWishlist(currentGame.id) ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      )}
                      <span className="ml-2 text-[14px]">
                        {isGameInWishlist(currentGame.id) ? "In Wishlist" : "Add to Wishlist"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 p-2 rounded-full hover:bg-black/70"
                onClick={handlePrev}
                tabIndex={0}
                aria-label="Previous slide"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 p-2 rounded-full hover:bg-black/70"
                onClick={handleNext}
                tabIndex={0}
                aria-label="Next slide"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          {/* Game list sidebar (right side) */}
          <div className="w-[200px] py-6">
            <div className="h-full flex flex-col justify-start">
              <div className="space-y-4">
                {games.map((game, index) => (
                  <div 
                    key={game.id} 
                    className={`relative flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                      currentSlide === index ? "bg-[#333333]/70" : "hover:bg-[#252525]"
                    }`}
                    onClick={() => handleTileClick(index)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View ${game.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleTileClick(index);
                      }
                    }}
                  >
                    {/* Progress background for current slide */}
                    {currentSlide === index && (
                      <div 
                        className="absolute inset-0 bg-[#444] rounded-xl transition-all duration-100 ease-linear z-0" 
                        style={{ 
                          width: `${progress}%`,
                          background: 'linear-gradient(90deg, rgba(80,80,80,0.5) 0%, rgba(60,60,60,0.5) 100%)'
                        }}
                      ></div>
                    )}
                    <div className="w-12 h-12 mr-3 relative overflow-hidden z-10">
                      <Image 
                        src={game.background_image || "https://placehold.co/48x48/121212/cccccc?text=No+Image"}
                        alt={game.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                      {game.released && new Date(game.released).getFullYear() >= 2023 && (
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] px-1">
                          NEW
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col z-10">
                      <span className="text-white text-sm line-clamp-1 font-medium">{game.name}</span>
                      {game.released && (
                        <span className="text-gray-400 text-xs">
                          {new Date(game.released).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && currentGame && (
        <PurchaseModal 
          game={currentGame} 
          onClose={handleClosePurchaseModal} 
        />
      )}
    </div>
  );
};

export default Carousel; 