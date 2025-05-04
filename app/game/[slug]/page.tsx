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
import SubNavbar from "@/app/components/SubNavbar";

type ScreenshotType = {
  id: number;
  image: string;
  isVideo?: boolean;
  videoUrl?: string;
  name?: string;
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
  const [activeIndex, setActiveIndex] = useState(0);
  
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
        
        // Fetch trailers
        let hasTrailer = false;
        try {
          const trailerData = await rawgApi.getGameTrailers(gameId);
          
          if (trailerData && trailerData.length > 0) {
            hasTrailer = true;
            // Add trailer as the first item
            const trailer = {
              id: -1,
              image: trailerData[0].preview,
              isVideo: true,
              videoUrl: trailerData[0].data.max || trailerData[0].data[480],
              name: trailerData[0].name
            };
            setCurrentScreenshot(trailer);
            setActiveIndex(0);
          }
        } catch (trailerErr) {
          console.error("Error fetching trailers:", trailerErr);
        }
        
        // Fetch screenshots using the dedicated screenshots endpoint
        try {
          const screenshotData = await rawgApi.getGameScreenshots(gameId);
          
          if (screenshotData && screenshotData.length > 0) {
            const processedScreenshots = screenshotData.map((s, index) => ({
              id: s.id,
              image: s.image,
              isVideo: false,
              name: `Screenshot ${index + 1}`
            }));
            
            if (hasTrailer) {
              // If we have a trailer, add it at the beginning of the screenshots array
              const allMedia = [
                {
                  id: -1,
                  image: currentScreenshot?.image || gameDetails.background_image,
                  isVideo: true,
                  videoUrl: currentScreenshot?.videoUrl,
                  name: currentScreenshot?.name || 'Game Trailer'
                },
                ...processedScreenshots
              ];
              setScreenshots(allMedia);
            } else {
              // If no trailer, use screenshots only
              setScreenshots(processedScreenshots);
              setCurrentScreenshot(processedScreenshots[0]);
              setActiveIndex(0);
            }
          } else if (gameDetails.short_screenshots && gameDetails.short_screenshots.length > 0) {
            // Fallback to short_screenshots if dedicated endpoint doesn't return results
            const processedScreenshots = gameDetails.short_screenshots.map((s, index) => ({
              id: s.id,
              image: s.image,
              isVideo: false,
              name: `Screenshot ${index + 1}`
            }));
            
            if (hasTrailer) {
              const allMedia = [
                {
                  id: -1,
                  image: currentScreenshot?.image || gameDetails.background_image,
                  isVideo: true,
                  videoUrl: currentScreenshot?.videoUrl,
                  name: currentScreenshot?.name || 'Game Trailer'
                },
                ...processedScreenshots
              ];
              setScreenshots(allMedia);
            } else {
              setScreenshots(processedScreenshots);
              setCurrentScreenshot(processedScreenshots[0]);
              setActiveIndex(0);
            }
          } else if (gameDetails.background_image) {
            // If no screenshots, use background image
            const fallbackScreenshot = {
              id: 0,
              image: gameDetails.background_image,
              isVideo: false,
              name: 'Game Cover'
            };
            
            if (hasTrailer) {
              setScreenshots([
                {
                  id: -1,
                  image: currentScreenshot?.image || gameDetails.background_image,
                  isVideo: true,
                  videoUrl: currentScreenshot?.videoUrl,
                  name: currentScreenshot?.name || 'Game Trailer'
                },
                fallbackScreenshot
              ]);
            } else {
              setScreenshots([fallbackScreenshot]);
              setCurrentScreenshot(fallbackScreenshot);
              setActiveIndex(0);
            }
          }
        } catch (screenshotErr) {
          console.error("Error fetching screenshots:", screenshotErr);
          
          // Fallback to existing implementation if screenshot endpoint fails
          if (gameDetails.short_screenshots && gameDetails.short_screenshots.length > 0) {
            const processedScreenshots = gameDetails.short_screenshots.map((s, index) => ({
              id: s.id,
              image: s.image,
              isVideo: false,
              name: `Screenshot ${index + 1}`
            }));
            
            if (hasTrailer) {
              const allMedia = [
                {
                  id: -1,
                  image: currentScreenshot?.image || gameDetails.background_image,
                  isVideo: true,
                  videoUrl: currentScreenshot?.videoUrl,
                  name: currentScreenshot?.name || 'Game Trailer'
                },
                ...processedScreenshots
              ];
              setScreenshots(allMedia);
            } else {
              setScreenshots(processedScreenshots);
              setCurrentScreenshot(processedScreenshots[0]);
              setActiveIndex(0);
            }
          } else if (gameDetails.background_image) {
            const fallbackScreenshot = {
              id: 0,
              image: gameDetails.background_image,
              isVideo: false,
              name: 'Game Cover'
            };
            
            if (hasTrailer) {
              setScreenshots([
                {
                  id: -1,
                  image: currentScreenshot?.image || gameDetails.background_image,
                  isVideo: true,
                  videoUrl: currentScreenshot?.videoUrl,
                  name: currentScreenshot?.name || 'Game Trailer'
                },
                fallbackScreenshot
              ]);
            } else {
              setScreenshots([fallbackScreenshot]);
              setCurrentScreenshot(fallbackScreenshot);
              setActiveIndex(0);
            }
          }
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
  
  const handleThumbnailClick = (screenshot: ScreenshotType, index: number) => {
    setCurrentScreenshot(screenshot);
    setActiveIndex(index);
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

  const handlePrevious = () => {
    const newIndex = activeIndex === 0 ? screenshots.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    setCurrentScreenshot(screenshots[newIndex]);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleNext = () => {
    const newIndex = activeIndex === screenshots.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
    setCurrentScreenshot(screenshots[newIndex]);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
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
        <SubNavbar />
        {/* Main content */}
        <div className="relative">
          {/* Hero Background */}
          
          {/* Game Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
            {/* Game Title and Release Date */}
            <div className="mb-8">
              <h1 className="text-5xl font-extrabold tracking-tight mb-2">{game.name}</h1>
              <div className="flex items-center gap-2 my-3 mx-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const rating = game.rating || 0;
                    const isFullStar = star <= Math.floor(rating);
                    const isPartialStar = star === Math.ceil(rating) && rating % 1 !== 0;
                    
                    return (
                      <span key={star} className="text-xl">
                        {isFullStar ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                          </svg>
                        ) : isPartialStar ? (
                          <span className="relative">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-800 absolute">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                            </svg>
                            <span className="absolute overflow-hidden" style={{ width: `${(rating % 1) * 100}%` }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                              </svg>
                            </span>
                          </span>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-800">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                          </svg>
                        )}
                      </span>
                    );
                  })}
                </div>
                {game.rating && <span className="text-sm font-normal text-gray-300 ml-5">{game.rating.toFixed(1)}</span>}
                
                {/* Additional information tags */}
                {game.tags && game.tags.length > 0 && (
                  <>
                    {/* <span className="mx-2">•</span> */}
                    <div className="flex items-center mx-3 font-normal text-gray-300">
                      <span className="text-lg">🎨</span>
                      <span>Inclusive Character Customization</span>
                    </div>
                    {/* <span className="mx-2">•</span> */}
                    <div className="flex items-center mx-3 font-normal text-gray-300">
                      <span className="text-lg">🐣</span>
                      <span>Great for Beginners</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Main Game Content in Two Columns */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Game Images */}
              <div className="lg:w-[65%]">
                {/* Main Media Viewer */}
                <div className="relative rounded-lg overflow-hidden mb-6">
                  <div className="relative aspect-video bg-black">
                    {currentScreenshot?.isVideo && currentScreenshot?.videoUrl ? (
                      <div className="w-full h-full relative">
                        <video 
                          ref={videoRef}
                          src={currentScreenshot.videoUrl}
                          poster={currentScreenshot.image}
                          className="w-full h-full object-contain"
                          onClick={handlePlayVideo}
                        />
                        {!isPlaying && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-40"
                            onClick={handlePlayVideo}
                          >
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white bg-opacity-80">
                              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-black">
                                <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Image 
                        src={currentScreenshot?.image || game.background_image || "https://placehold.co/1200x600/121212/cccccc?text=No+Image"}
                        alt={game.name}
                        fill
                        className="object-contain"
                        priority
                      />
                    )}
                    
                    {/* Carousel navigation arrows */}
                    <button 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full"
                      onClick={handlePrevious}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
                        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full"
                      onClick={handleNext}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Thumbnails Row */}
                {screenshots.length > 1 && (
                  <div 
                    className="flex justify-center gap-2 mb-8 pb-2" 
                    style={{ 
                      scrollbarWidth: 'none', 
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    <style jsx>{`
                      div::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    {screenshots.slice(0, 6).map((screenshot, index) => (
                      <div 
                        key={screenshot.id} 
                        className={`relative flex-shrink-0 w-[120px] aspect-video rounded overflow-hidden cursor-pointer border-2 transition-all ${
                          activeIndex === index ? 'border-blue-500 scale-105' : 'border-transparent opacity-80'
                        }`}
                        onClick={() => handleThumbnailClick(screenshot, index)}
                      >
                        <Image 
                          src={screenshot.image}
                          alt={screenshot.name || `${game.name} media`}
                          fill
                          className="object-cover"
                        />
                        {screenshot.isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black bg-opacity-70">
                              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                                <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Game Description */}
                <div className="rounded-lg p-6 mb-6">
                  {/* <h2 className="text-xl font-bold mb-4">About {game.name}</h2> */}
                  <div className="text-gray-300 space-y-4">
                    {game.description_raw ? (
                      <p className="leading-relaxed">{game.description_raw.slice(0, 800)}...</p>
                    ) : (
                      <p>No description available for this game.</p>
                    )}
                  </div>
                </div>
                
                {/* Game Genres and Features */}
                <div className="flex flex-col md:flex-row mb-8 gap-x-16 gap-y-6">
                  {/* Genres Column */}
                  <div>
                    <h3 className="text-base text-gray-400 mb-1">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {game.genres && game.genres.map((genre) => (
                        <span 
                          key={genre.id} 
                          className="bg-[#333] px-2 py-1 rounded-md text-sm font-medium"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  
                  {/* Features Column */}
                  <div className="flex items-center">
                  <div className="w-[1px] h-[50px] bg-[#333] mx-4">
                  </div>
                  <div>
                    <h3 className="text-base text-gray-400 mb-1">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {game.tags && game.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag.id} 
                          className="bg-[#333] px-2 py-1 rounded-md text-sm font-medium"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {game.platforms && game.platforms.some(p => p.platform.name.includes('PlayStation') || p.platform.name.includes('Xbox') || p.platform.name.includes('Nintendo')) && (
                        <span className="bg-[#333] px-4 py-2 rounded-md text-sm font-medium">
                          Controller Support
                        </span>
                      )}
                      {game.tags && game.tags.some(tag => 
                        tag.name.toLowerCase().includes('multiplayer') || 
                        tag.name.toLowerCase().includes('online') || 
                        tag.name.toLowerCase().includes('co-op')
                      )}
                    </div>
                  </div>
                  </div>
                </div>

                {/* Reactions section  */}
                <div className="py-10">
                  <h2 className="text-2xl font-bold mb-2">Epic Player Ratings</h2>
                  <p className="text-gray-400 mb-8">Captured from players in the Epic Games ecosystem.</p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center mb-10">
                    <span className="text-5xl font-bold mr-4">{game.rating ? game.rating.toFixed(1) : '0.0'}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const rating = game.rating || 0;
                        const isFullStar = star <= Math.floor(rating);
                        const isPartialStar = star === Math.ceil(rating) && rating % 1 !== 0;
                        
                        return (
                          <div key={star} className="relative w-9 h-9">
                            {/* Empty star background */}
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute text-gray-800">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                            </svg>
                            
                            {/* Full or partial star overlay */}
                            {(isFullStar || isPartialStar) && (
                              <div className="absolute overflow-hidden" style={{ width: isPartialStar ? `${(rating % 1) * 100}%` : '100%' }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                                </svg>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Reaction Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1 */}
                    <div className="bg-[#202020] p-6 rounded-lg flex flex-col items-center text-center">
                      <div className="mb-4 text-4xl">🎨</div>
                      <p className="text-gray-400 text-sm mb-1">This game has</p>
                      <h3 className="font-bold">Character Customization</h3>
                    </div>
                    
                    {/* Card 2 */}
                    <div className="bg-[#202020] p-6 rounded-lg flex flex-col items-center text-center">
                      <div className="mb-4 text-4xl">🐣</div>
                      <p className="text-gray-400 text-sm mb-1">This game is</p>
                      <h3 className="font-bold">Great for Beginners</h3>
                    </div>
                    
                    {/* Card 3 */}
                    <div className="bg-[#202020] p-6 rounded-lg flex flex-col items-center text-center">
                      <div className="mb-4 text-4xl">⏱️</div>
                      <p className="text-gray-400 text-sm mb-1">This game is</p>
                      <h3 className="font-bold">Great for Quick Sessions</h3>
                    </div>
                    
                    {/* Card 4 */}
                    <div className="bg-[#202020] p-6 rounded-lg flex flex-col items-center text-center">
                      <div className="mb-4 text-4xl">🌐</div>
                      <p className="text-gray-400 text-sm mb-1">This game has</p>
                      <h3 className="font-bold">Diverse Characters</h3>
                    </div>
                    
                    {/* Card 5 */}
                    <div className="bg-[#202020] p-6 rounded-lg flex flex-col items-center text-center">
                      <div className="mb-4 text-4xl">🎭</div>
                      <p className="text-gray-400 text-sm mb-1">This game has</p>
                      <h3 className="font-bold">Amazing Characters</h3>
                    </div>
                    
                    {/* Card 6 */}
                    <div className="bg-[#202020] p-6 rounded-lg flex flex-col items-center text-center">
                      <div className="mb-4 text-4xl">📢</div>
                      <p className="text-gray-400 text-sm mb-1">This game is</p>
                      <h3 className="font-bold">Highly Recommended</h3>
                    </div>
                  </div>
                </div>

                {/* System Requirements section  */}
                <div className="py-6">
                  <h2 className="text-2xl font-bold mb-6">{game.name} System Requirements</h2>
                  
                  <div className="bg-[#202020] rounded-lg p-6">
                    {/* Platform Tabs */}
                    <div className="mb-8">
                      <div className="inline-block relative">
                        <button className="text-white font-medium border-b-2 border-blue-500 pb-1">
                          Windows
                        </button>
                      </div>
                    </div>
                    
                    {/* Specs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Minimum Requirements */}
                      <div>
                        <h3 className="text-xl font-bold mb-4">Minimum</h3>
                        
                        <div className="space-y-6">
                          <div>
                            <p className="text-gray-400 text-sm">OS version</p>
                            <p>Windows 7 SP1 64-bit</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 text-sm">CPU</p>
                            <p>Intel® Core™ i5 Processor</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 text-sm">Memory</p>
                            <p>8 GB</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 text-sm">GPU</p>
                            <p>Nvidia GeForce GTX 650 or better</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Recommended Requirements */}
                      <div>
                        <h3 className="text-xl font-bold mb-4">Recommended</h3>
                        
                        <div className="space-y-6">
                          <div>
                            <p className="text-gray-400 text-sm">OS version</p>
                            <p>Windows 7 SP1 64-bit</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 text-sm">CPU</p>
                            <p>Intel® Core™ i5 Processor</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 text-sm">Memory</p>
                            <p>8 GB</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 text-sm">GPU</p>
                            <p>Nvidia GeForce GTX 1060 or higher</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Requirements */}
                    <div className="mt-8 space-y-6">
                      <div>
                        <p className="text-gray-400 text-sm">Login Accounts Required</p>
                        <p>Epic ID</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Languages Supported</p>
                        <p>Audio: English, Chinese (Simplified), Japanese, Korean</p>
                        <p className="mt-4">Text: English, Chinese (Simplified), Chinese (Traditional), French, German, Japanese, Korean, Portuguese (Brazil), Russian, Spanish (Spain), Thai, Vietnamese</p>
                      </div>
                      
                      <div className="pt-8 mt-8 border-t border-[#333] text-sm text-gray-500">
                        <p>Copyright © COGNOSPHERE. All Rights Reserved.</p>
                        <a href="#" className="inline-flex items-center mt-2">
                          Privacy Policy
                          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15 3h6v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 14L21 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column: Purchase Info */}
              <div className="lg:w-[35%] mt-8 lg:mt-0">
                <div className="sticky top-[100px]">
                  {/* Game Logo */}
                  <div className="flex justify-center mb-6">
                    <h1 className="text-7xl font-black text-center">{game.name}</h1>
                  </div>
                  
                  {/* ESRB Rating */}
                  <div className="rounded-lg p-4 mb-4 border border-[#333] hover:border-[#fff] cursor-pointer">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="border border-white p-1">
                          <div className="bg-black text-white font-bold flex items-center justify-center w-14 h-14">
                            <span className="text-lg">{game.esrb_rating ? game.esrb_rating.name.slice(0, 3) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{game.esrb_rating ? game.esrb_rating.name : 'Not Rated'}</div>
                        <div className="mt-3 text-gray-400 text-sm">
                          {game.esrb_rating ? (
                            <>
                              {game.esrb_rating.slug === 'mature' && 'Violence, Blood, Language, Mature Themes'}
                              {game.esrb_rating.slug === 'teen' && 'Moderate Violence, Mild Language'}
                              {game.esrb_rating.slug === 'everyone-10-plus' && 'Fantasy Violence, Mild Language'}
                              {game.esrb_rating.slug === 'everyone' && 'Suitable for All Ages'}
                              {!['mature', 'teen', 'everyone-10-plus', 'everyone'].includes(game.esrb_rating.slug) && 'Users Interact, In-Game Purchases'}
                            </>
                          ) : 'Users Interact, In-Game Purchases (Includes Random Items)'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Edition Selection */}
                  <div className="mb-4 rounded-lg py-1">
                    <span className="bg-[#333] p-2 rounded-md text-sm">
                      Base Game
                    </span>
                  </div>
                  
                  {/* Price and Purchase */}
                  {isGameOwned ? (
                    <div className="mb-4">
                      <Link href="/library">
                        <button className="w-full bg-[#1877F2] hover:bg-[#1865D2] text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2" tabIndex={0}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6Z" fill="currentColor"/>
                            <path d="M20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 12H8V4H20V12Z" fill="currentColor"/>
                          </svg>
                          <span>In Library</span>
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <div className="text-2xl font-bold">Free</div>
                        <div className="text-sm text-gray-400 mb-4">May include in-app purchases</div>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <button 
                          className="w-full bg-[#1877F2] hover:bg-[#1865D2] text-white font-medium py-3 rounded-xl" 
                          onClick={handleBuyNow}
                          tabIndex={0}
                        >
                          Get
                        </button>
                        <button className="w-full bg-[#555] hover:bg-[#666] text-white font-medium py-3 rounded-xl" tabIndex={0}>
                          Add To Cart
                        </button>
                        <button className="w-full bg-[#333] hover:bg-[#444] text-white font-medium py-3 rounded-xl" tabIndex={0}>
                          Add to Wishlist
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* Game Details */}
                  <div className="border-t border-[#333] pt-4 space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Developer</span>
                      <span>COGNOSPHERE PTE. LTD.</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Publisher</span>
                      <span>COGNOSPHERE PTE. LTD.</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Release Date</span>
                      <span>{game.released ? new Date(game.released).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: '2-digit'}) : 'Unknown'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-4 border-b border-[#333]">
                      <span className="text-gray-400">Platform</span>
                      <span className="flex space-x-2">
                        {game.platforms && game.platforms.length > 0 ? (
                          <>
                            {game.platforms.some(p => 
                              p.platform.name.toLowerCase().includes('pc') || 
                              p.platform.name.toLowerCase().includes('windows') || 
                              p.platform.name.toLowerCase().includes('linux') || 
                              p.platform.name.toLowerCase().includes('mac')
                            ) && (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M0 3.449L9.75 2.1V11.551H0V3.449ZM10.949 1.949L24 0V11.4H10.949V1.949ZM0 12.6H9.75V22.051L0 20.699V12.6ZM10.949 12.6H24V24L11.1 22.199" />
                              </svg>
                            )}
                            {game.platforms.some(p => 
                              p.platform.name.toLowerCase().includes('playstation') || 
                              p.platform.name.toLowerCase().includes('ps4') || 
                              p.platform.name.toLowerCase().includes('ps5')
                            ) && (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.5 7.5V17.5H7.5V7.5M10.5 6.5V18.5H6.5V6.5M13.5 6.5H16.5C17.6 6.5 18.5 7.4 18.5 8.5V16.5C18.5 17.6 17.6 18.5 16.5 18.5H13.5V6.5M12.5 5.5V19.5H16.5C18.16 19.5 19.5 18.16 19.5 16.5V8.5C19.5 6.84 18.16 5.5 16.5 5.5M3.5 5.5H5.5V19.5H3.5" />
                              </svg>
                            )}
                            {game.platforms.some(p => 
                              p.platform.name.toLowerCase().includes('xbox') || 
                              p.platform.name.toLowerCase().includes('xbone') || 
                              p.platform.name.toLowerCase().includes('series')
                            ) && (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5.57 6.66C6.29 6.31 9.79 8 12 10.25C14.2 8 17.7 6.31 18.42 6.66C18.5 7.25 18.54 7.56 18.58 8.17C16.5 7.58 14.12 9.97 13.95 10.15C13.2 10.92 12.5 11.92 12 12.55C11.5 11.92 10.8 10.92 10.05 10.15C9.88 9.97 7.5 7.58 5.42 8.17C5.46 7.56 5.5 7.25 5.58 6.66M2.3 8.1C4.5 5.8 4.86 2.04 4.96 2C5.79 2.07 11.85 5.77 12 6.45V7.26C11.12 6.34 7.22 2.92 5.53 3.10C5.55 3.76 5.71 6.92 3.63 8.94C2.87 9.69 2.43 10.7 2 11.76C2.27 10.62 2.78 9.08 3.17 8.5C2.84 8.37 2.57 8.24 2.3 8.1M21 11.76C20.57 10.7 20.13 9.69 19.37 8.94C17.29 6.92 17.45 3.76 17.47 3.1C15.78 2.92 11.88 6.34 11 7.26V6.45C11.15 5.77 17.21 2.07 18.04 2C18.14 2.04 18.5 5.8 20.7 8.1C20.43 8.24 20.16 8.37 19.83 8.5C20.22 9.08 20.73 10.62 21 11.76M21.6 17.47C20.47 16.38 18.59 15.42 17.42 16.58C16.87 17.13 16.78 18.13 17.29 18.93C18.36 20.6 21.16 19.81 21.5 19.22C21.64 18.41 21.63 17.83 21.6 17.47M15.96 13.53C16.81 9.47 15.36 9.43 14.3 9.43L7.54 9.42C7.5 10.42 7.62 12.84 7.62 13.51C7.62 16.57 10.95 16.36 12.54 16.36C14.2 16.36 15.8 16.5 15.96 13.53M2.5 19.22C2.84 19.81 5.64 20.6 6.71 18.93C7.22 18.13 7.13 17.13 6.58 16.58C5.41 15.42 3.53 16.38 2.4 17.47C2.37 17.83 2.36 18.41 2.5 19.22Z" />
                              </svg>
                            )}
                            {game.platforms.some(p => 
                              p.platform.name.toLowerCase().includes('nintendo') || 
                              p.platform.name.toLowerCase().includes('switch')
                            ) && (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10.04,20.4H7.12C6.19,20.4 5.3,20 4.67,19.36C4.03,18.73 3.63,17.84 3.63,16.9V7.1C3.63,6.17 4.03,5.27 4.67,4.64C5.3,4 6.19,3.6 7.12,3.6H10.04V20.4M7.12,2A5.12,5.12 0 0,0 2,7.12V16.88C2,19.71 4.29,22 7.12,22H11.65V2H7.12M5.11,8C5.11,9.04 5.95,9.88 7,9.88C8.03,9.88 8.87,9.04 8.87,8C8.87,6.96 8.03,6.12 7,6.12C5.95,6.12 5.11,6.96 5.11,8M17.61,11C18.72,11 19.62,11.89 19.62,13C19.62,14.12 18.72,15 17.61,15C16.5,15 15.58,14.12 15.58,13C15.58,11.89 16.5,11 17.61,11M17.61,9C15.56,9 13.87,10.69 13.87,13C13.87,15.31 15.56,17 17.61,17C19.67,17 21.36,15.31 21.36,13C21.36,10.69 19.67,9 17.61,9Z" />
                              </svg>
                            )}
                            {!game.platforms.some(p => 
                              p.platform.name.toLowerCase().includes('pc') || 
                              p.platform.name.toLowerCase().includes('windows') || 
                              p.platform.name.toLowerCase().includes('playstation') || 
                              p.platform.name.toLowerCase().includes('ps4') || 
                              p.platform.name.toLowerCase().includes('ps5') ||
                              p.platform.name.toLowerCase().includes('xbox') || 
                              p.platform.name.toLowerCase().includes('nintendo') || 
                              p.platform.name.toLowerCase().includes('switch')
                            ) && (
                              // Generic computer icon as fallback
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z" />
                              </svg>
                            )}
                          </>
                        ) : (
                          // Fallback if no platforms data
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z" />
                          </svg>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {/* Share and Report */}
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-[#333] hover:bg-[#444] text-white font-medium py-2 rounded-xl flex items-center justify-center" tabIndex={0}>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12Z" />
                      </svg>
                      Share
                    </button>
                    <button className="flex-1 bg-[#333] hover:bg-[#444] text-white font-medium py-2 rounded-xl flex items-center justify-center" tabIndex={0}>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6L21 6.00019M3 12L21 12.0002M3 18L21 18.0002" />
                      </svg>
                      Report
                    </button>
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