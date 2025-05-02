"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getRawgApi, Game } from "../../services/rawg-api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function GameDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Navbar />
        <div className="pt-[72px] flex items-center justify-center h-[calc(100vh-72px)]">
          <p>Loading game details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Navbar />
        <div className="pt-[72px] flex flex-col items-center justify-center h-[calc(100vh-72px)]">
          <p className="text-xl mb-4">Error: {error || "Game not found"}</p>
          <Link 
            href="/" 
            className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded text-sm font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Navbar />
      <div className="pt-[72px]">
        {/* Hero section with game banner */}
        <div className="relative h-[500px] w-full">
          <Image
            src={game.background_image || "https://placehold.co/1200x500/121212/cccccc?text=No+Image"}
            alt={game.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
            <div className="flex items-center mb-4">
              {game.metacritic && (
                <span className={`text-sm px-2 py-1 rounded mr-4 ${
                  game.metacritic >= 80 ? "bg-green-700" : 
                  game.metacritic >= 60 ? "bg-yellow-600" : "bg-red-700"
                }`}>
                  {game.metacritic}
                </span>
              )}
              {game.released && (
                <span className="text-sm text-gray-300">Released: {new Date(game.released).toLocaleDateString()}</span>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-2">{game.name}</h1>
            
            <div className="flex flex-wrap mb-4">
              {game.genres?.map((genre) => (
                <span key={genre.id} className="text-sm bg-[#333] px-3 py-1 rounded mr-2 mb-2">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Game details section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <div className="text-gray-300 mb-8 space-y-4">
                <p>{game.description_raw || "No description available for this game."}</p>
              </div>
              
              {/* Screenshots */}
              {game.short_screenshots && game.short_screenshots.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Screenshots</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {game.short_screenshots.slice(0, 4).map((screenshot) => (
                      <div key={screenshot.id} className="relative h-48 rounded-lg overflow-hidden">
                        <Image
                          src={screenshot.image}
                          alt={`${game.name} screenshot`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="w-full md:w-80 space-y-6">
              <div className="bg-[#202020] p-4 rounded-lg">
                <button className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 rounded mb-3">
                  Buy Now
                </button>
                <button className="w-full bg-[#333] hover:bg-[#444] text-white font-medium py-3 rounded flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  Add to Wishlist
                </button>
              </div>
              
              {/* Platforms */}
              {game.platforms && game.platforms.length > 0 && (
                <div className="bg-[#202020] p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Platforms</h3>
                  <div className="flex flex-wrap">
                    {game.platforms.map(({ platform }) => (
                      <span key={platform.id} className="text-sm bg-[#333] px-2 py-1 rounded mr-2 mb-2">
                        {platform.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Rating */}
              {game.rating && (
                <div className="bg-[#202020] p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Rating</h3>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < Math.round(game.rating || 0) ? "text-yellow-400" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-300">
                      {game.rating?.toFixed(1)} ({game.ratings_count} reviews)
                    </span>
                  </div>
                </div>
              )}
              
              {/* Tags */}
              {game.tags && game.tags.length > 0 && (
                <div className="bg-[#202020] p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap">
                    {game.tags.slice(0, 10).map((tag) => (
                      <span key={tag.id} className="text-xs bg-[#333] px-2 py-1 rounded mr-2 mb-2">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Stores */}
              {game.stores && game.stores.length > 0 && (
                <div className="bg-[#202020] p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Available On</h3>
                  <div className="space-y-2">
                    {game.stores.map(({ store }) => (
                      <div key={store.id} className="flex items-center">
                        <span className="text-sm">{store.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
} 