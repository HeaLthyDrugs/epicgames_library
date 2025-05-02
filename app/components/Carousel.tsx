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
                  {/* Metacritic tag */}
                  <div className="flex items-center mb-2 gap-2">
                    {currentGame.metacritic && (
                      <>
                        <span className={`text-sm px-2 py-1 rounded ${
                          currentGame.metacritic >= 80 ? "bg-green-700" : 
                          currentGame.metacritic >= 60 ? "bg-yellow-600" : "bg-red-700"
                        }`}>
                          {currentGame.metacritic}
                        </span>
                        <span className="text-[14px] uppercase tracking-wider font-medium text-white">Metacritic</span>
                      </>
                    )}
                    
                    {/* New Release badge */}
                    {currentGame.released && new Date(currentGame.released).getFullYear() >= 2023 && (
                      <span className="text-sm px-2 py-1 bg-blue-600 rounded ml-2">
                        NEW RELEASE
                      </span>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-4xl font-bold text-white mb-2">{currentGame.name}</h2>
                  
                  {/* Release date and genres */}
                  <div className="flex items-center mb-3">
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
                  </div>
                  
                  {/* Description - Using a placeholder since RAWG API doesn't return full descriptions in the games list */}
                  <p className="text-base text-white mb-6 max-w-md font-light">
                    {currentGame.released && new Date(currentGame.released).getFullYear() >= 2022 
                      ? `Experience ${currentGame.name}, one of the most popular recent releases with stunning visuals and innovative gameplay. Join millions of players worldwide in this cutting-edge adventure.`
                      : `Explore ${currentGame.name}, a highly-rated game with amazing graphics and immersive gameplay. Discover why this title continues to captivate gamers everywhere.`
                    }
                  </p>
                  
                  {/* Buttons */}
                  <div className="flex items-center space-x-4">
                    <Link 
                      href={`/game/${currentGame.slug}`} 
                      className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded text-[14px] font-medium"
                      tabIndex={0}
                      aria-label={`View ${currentGame.name}`}
                    >
                      View Game
                    </Link>
                    <button 
                      className="bg-[#0074e4] hover:bg-[#0066cc] text-white px-6 py-3 rounded text-[14px] font-medium flex items-center"
                      onClick={handleBuyGame}
                      tabIndex={0}
                      aria-label={`Buy ${currentGame.name}`}
                    >
                      <span>Buy Now</span>
                    </button>
                    <button 
                      className="bg-transparent border border-white text-white hover:bg-white/10 px-4 py-3 rounded flex items-center"
                      tabIndex={0}
                      aria-label="Add to Wishlist"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span className="ml-2 text-[14px]">Add to Wishlist</span>
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
          <div className="w-[300px] py-6">
            <div className="h-full flex flex-col justify-start">
              <div className="space-y-4">
                {games.map((game, index) => (
                  <div 
                    key={game.id} 
                    className={`relative flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSlide === index ? "bg-[#333333]" : "bg-[#202020]/70 hover:bg-[#252525]"
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
                    <div className="w-12 h-12 mr-3 relative overflow-hidden rounded">
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
                    <div className="flex flex-col">
                      <span className="text-white text-sm line-clamp-1 font-medium">{game.name}</span>
                      {game.released && (
                        <span className="text-gray-400 text-xs">
                          {new Date(game.released).getFullYear()}
                        </span>
                      )}
                    </div>
                    
                    {/* Progress indicator */}
                    {currentSlide === index && (
                      <div className="absolute bottom-0 left-0 h-1 bg-[#444] w-full">
                        <div 
                          className="h-full bg-white transition-all duration-100 ease-linear" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    )}
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