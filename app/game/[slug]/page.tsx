"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getRawgApi, Game } from "../../services/rawg-api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useLibrary } from '../../context/LibraryContext';
import PurchaseModal from '../../components/PurchaseModal';

type ScreenshotType = {
  id: number;
  image: string;
  isVideo?: boolean;
};

export default function GameDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentScreenshot, setCurrentScreenshot] = useState<ScreenshotType | null>(null);
  const [screenshots, setScreenshots] = useState<ScreenshotType[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { isGameInLibrary } = useLibrary();
  
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setLoading(true);
        const rawgApi = getRawgApi();
        
        // First search for the game by slug to get its ID
        const searchResults = await rawgApi.searchGames(slug, 1);
        
        if (searchResults.length === 0) {
          throw new Error("Game not found");
        }
        
        // Then fetch the detailed information using the ID
        const gameId = searchResults[0].id;
        const gameDetails = await rawgApi.getGameDetails(gameId);
        setGame(gameDetails);
        
        // Process screenshots and add a fake video for demo purposes
        let processedScreenshots: ScreenshotType[] = [];
        
        if (gameDetails.short_screenshots && gameDetails.short_screenshots.length > 0) {
          processedScreenshots = gameDetails.short_screenshots.map(s => ({
            id: s.id,
            image: s.image,
            isVideo: false
          }));
          
          // Add a fake video as the first item for demo
          processedScreenshots.unshift({
            id: 0,
            image: gameDetails.background_image,
            isVideo: true
          });
          
          setScreenshots(processedScreenshots);
          setCurrentScreenshot(processedScreenshots[0]);
        } else if (gameDetails.background_image) {
          // If no screenshots, use background image
          const fallbackScreenshot = {
            id: 0,
            image: gameDetails.background_image,
            isVideo: false
          };
          setScreenshots([fallbackScreenshot]);
          setCurrentScreenshot(fallbackScreenshot);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching game details:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchGameDetails();
    }
  }, [slug]);
  
  const handleThumbnailClick = (screenshot: ScreenshotType) => {
    setCurrentScreenshot(screenshot);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };
  
  const handlePlayVideo = () => {
    if (videoRef.current && currentScreenshot?.isVideo) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleBuyNow = () => {
    setShowPurchaseModal(true);
  };
  
  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Navbar />
        <div className="pt-[72px] flex items-center justify-center h-[calc(100vh-72px)]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Navbar />
        <div className="pt-[72px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-[#202020] rounded-lg p-8">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p>{error || 'Game not found'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const isGameOwned = isGameInLibrary(game.id);
  
  // Format game name for logo display
  const gameNameFormatted = game.name.replace(/[^\w\s]/gi, '').toUpperCase(); 
  
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Navbar />
      <div className="pt-[72px]">
        {/* Search bar similar to Epic Games Store */}
        <div className="bg-[#121212] border-b border-[#202020] py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-gray-300">Discover</button>
              <button className="text-white hover:text-gray-300">Browse</button>
              <button className="text-white hover:text-gray-300">News</button>
            </div>
            <div className="relative">
              <input
                type="search"
                placeholder="Search store"
                className="bg-[#202020] text-white px-4 py-2 pl-10 rounded-full text-sm w-[250px]"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-white hover:text-gray-300">Wishlist</button>
              <button className="text-white hover:text-gray-300">Cart</button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="relative">
          {/* Hero Background */}
          <div className="absolute inset-0 h-[500px] overflow-hidden z-0">
            <div className="relative h-full w-full">
              <Image 
                src={game.background_image || "https://placehold.co/1200x500/121212/cccccc?text=No+Background"}
                alt={game.name}
                fill
                className="object-cover opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]"></div>
            </div>
          </div>
          
          {/* Game Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
            {/* Game Title and Release Date */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">{game.name}</h1>
              <div className="flex items-center space-x-3 text-gray-400">
                {game.released && (
                  <span>Released: {new Date(game.released).toLocaleDateString()}</span>
                )}
                {game.metacritic && (
                  <>
                    <span>•</span>
                    <div className={`px-2 py-0.5 text-sm rounded ${
                      game.metacritic >= 75 ? 'bg-green-700' : 
                      game.metacritic >= 50 ? 'bg-yellow-600' : 'bg-red-700'
                    }`}>
                      {game.metacritic}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Main Game Content in Two Columns */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Game Images */}
              <div className="lg:w-[65%]">
                {/* Main Game Image */}
                <div className="rounded-lg overflow-hidden mb-6">
                  <div className="relative aspect-video">
                    <Image 
                      src={game.background_image || "https://placehold.co/1200x600/121212/cccccc?text=No+Image"}
                      alt={game.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                
                {/* Screenshots */}
                {game.short_screenshots && game.short_screenshots.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-8">
                    {game.short_screenshots.slice(0, 4).map((screenshot) => (
                      <div key={screenshot.id} className="relative aspect-video rounded overflow-hidden">
                        <Image 
                          src={screenshot.image}
                          alt={`${game.name} screenshot`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Game Description */}
                <div className="bg-[#1A1A1A] rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">About {game.name}</h2>
                  <div className="text-gray-300 space-y-4">
                    {game.description_raw ? (
                      <p className="leading-relaxed">{game.description_raw.slice(0, 800)}...</p>
                    ) : (
                      <p>No description available for this game.</p>
                    )}
                  </div>
                </div>
                
                {/* Game Genre Tags */}
                {game.genres && game.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {game.genres.map((genre) => (
                      <span 
                        key={genre.id} 
                        className="bg-[#333] px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                    {game.tags && game.tags.slice(0, 5).map((tag) => (
                      <span 
                        key={tag.id} 
                        className="bg-[#333] px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Right Column: Purchase Info */}
              <div className="lg:w-[35%] mt-8 lg:mt-0">
                <div className="sticky top-[100px]">
                  {/* Game Logo */}
                  <div className="flex justify-center mb-6">
                    <Image 
                      src={game.background_image || "https://placehold.co/400x200/121212/cccccc?text=Logo"}
                      alt={game.name}
                      width={400}
                      height={150}
                      className="object-contain"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  </div>
                  
                  {/* Age Rating */}
                  <div className="bg-[#1A1A1A] rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-1">
                      <div className="border border-white p-1 mr-3">
                        <div className="flex items-center justify-center bg-black text-white font-bold">
                          <span className="text-2xl">3+</span>
                        </div>
                      </div>
                      <span className="text-sm">Users Interact, In-Game Purchases</span>
                    </div>
                  </div>
                  
                  {/* Edition Selection */}
                  <div className="mb-4">
                    <div className="bg-[#202020] px-3 py-2 rounded">
                      Base Game
                    </div>
                  </div>
                  
                  {/* Price and Purchase */}
                  <div className="bg-[#1A1A1A] rounded-lg p-6 mb-6">
                    <div className="text-3xl font-bold mb-4">
                      {isGameOwned ? 'In Library' : 'Free'}
                    </div>
                    
                    <button 
                      className={`w-full ${
                        isGameOwned 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-[#0074E4] hover:bg-[#0066CC]'
                      } text-white font-medium py-3 rounded mb-3`}
                      onClick={isGameOwned ? undefined : handleBuyNow}
                      disabled={isGameOwned}
                      tabIndex={0}
                    >
                      {isGameOwned ? 'Owned' : 'Buy Now'}
                    </button>
                    <button className="w-full bg-[#333] hover:bg-[#444] text-white font-medium py-3 rounded mb-3" tabIndex={0}>
                      Add To Cart
                    </button>
                    <button className="w-full bg-[#333] hover:bg-[#444] text-white font-medium py-3 rounded" tabIndex={0}>
                      Add to Wishlist
                    </button>
                  </div>
                  
                  {/* Game Details */}
                  <div className="bg-[#1A1A1A] rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-[#333]">
                      <span className="text-gray-400">Epic Rewards</span>
                      <div className="flex items-center">
                        <span>Earn 5% Back</span>
                        <svg className="w-5 h-5 ml-1 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4M12 16h.01" stroke="black" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-[#333]">
                      <span className="text-gray-400">Refund Type</span>
                      <div className="flex items-center">
                        <span>Self-Refundable</span>
                        <svg className="w-5 h-5 ml-1 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4M12 16h.01" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-[#333]">
                      <span className="text-gray-400">Developer</span>
                      <span>COGNOSPHERE PTE. LTD.</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-[#333]">
                      <span className="text-gray-400">Publisher</span>
                      <span>COGNOSPHERE PTE. LTD.</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-[#333]">
                      <span className="text-gray-400">Release Date</span>
                      <span>{game.released ? new Date(game.released).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Platform</span>
                      <span>
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 18C21.1 18 22 17.1 22 16V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H0V20H24V18H20ZM4 6H20V16H4V6Z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
      
      {/* Purchase Modal */}
      {showPurchaseModal && game && (
        <PurchaseModal game={game} onClose={handleClosePurchaseModal} />
      )}
    </div>
  );
} 