"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRawgApi, Game } from "../services/rawg-api";
import Navbar from "../components/Navbar";
import SubNavbar from "../components/SubNavbar";
import Footer from "../components/Footer";

export default function FreeGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const rawgApi = getRawgApi();
        // For demo purposes, we're using the newest games from the API
        // In a real app, you'd want to filter specifically for free games
        const newGames = await rawgApi.getNewGames(12);
        setGames(newGames);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGames();
  }, []);
  
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Navbar />
      <div className="pt-[72px]">
        <SubNavbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center mb-8">
            <svg className="w-6 h-6 text-white mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 12a8 8 0 01-8 8v-2a6 6 0 006-6h2zm0-8a2 2 0 012 2v1.18c-.9-.14-1.8-.18-2.7-.18H20V4zM8.82 12c0 .34.03.67.08 1H4v2h3.18c.19.7.45 1.39.82 2H4v2h5.17c1.13 1.19 2.58 2 4.18 2H4a2 2 0 01-2-2v-8a2 2 0 012-2h10.17A7.919 7.919 0 008.82 12z" />
            </svg>
            <h1 className="text-3xl font-bold">Free Games</h1>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-white">Loading games...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center py-12">
              <div className="text-white">Error: {error}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {games.map((game) => (
                <Link 
                  key={game.id} 
                  href={`/game/${game.slug}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="relative h-48 w-full">
                      <Image
                        src={game.background_image || "https://placehold.co/600x400/121212/cccccc?text=No+Image"}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="inline-block px-3 py-1 mb-2 text-xs font-medium bg-purple-600 text-white">
                        FREE NOW
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#202020] p-4 rounded-b-lg">
                    <h3 className="text-lg font-medium text-white mb-2">{game.name}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-400">
                        {game.released ? new Date(game.released).toLocaleDateString() : "Available now"}
                      </p>
                      <div className="flex items-center">
                        {game.metacritic && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            game.metacritic >= 80 ? "bg-green-700" : 
                            game.metacritic >= 60 ? "bg-yellow-600" : "bg-red-700"
                          }`}>
                            {game.metacritic}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
} 