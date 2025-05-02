"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRawgApi, Game } from "../services/rawg-api";

const FreeGames = () => {
  const [freeGames, setFreeGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFreeGames = async () => {
      try {
        setLoading(true);
        const rawgApi = getRawgApi();
        // For this demo, we'll use new games instead of specifically free games
        // since RAWG API doesn't have a direct filter for free games
        const newGames = await rawgApi.getNewGames(3);
        setFreeGames(newGames);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching free games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreeGames();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#121212] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-white mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 12a8 8 0 01-8 8v-2a6 6 0 006-6h2zm0-8a2 2 0 012 2v1.18c-.9-.14-1.8-.18-2.7-.18H20V4zM8.82 12c0 .34.03.67.08 1H4v2h3.18c.19.7.45 1.39.82 2H4v2h5.17c1.13 1.19 2.58 2 4.18 2H4a2 2 0 01-2-2v-8a2 2 0 012-2h10.17A7.919 7.919 0 008.82 12z" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Free Games</h2>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="text-white">Loading games...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#121212] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-white mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 12a8 8 0 01-8 8v-2a6 6 0 006-6h2zm0-8a2 2 0 012 2v1.18c-.9-.14-1.8-.18-2.7-.18H20V4zM8.82 12c0 .34.03.67.08 1H4v2h3.18c.19.7.45 1.39.82 2H4v2h5.17c1.13 1.19 2.58 2 4.18 2H4a2 2 0 01-2-2v-8a2 2 0 012-2h10.17A7.919 7.919 0 008.82 12z" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Free Games</h2>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="text-white">Error: {error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#121212] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-white mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 12a8 8 0 01-8 8v-2a6 6 0 006-6h2zm0-8a2 2 0 012 2v1.18c-.9-.14-1.8-.18-2.7-.18H20V4zM8.82 12c0 .34.03.67.08 1H4v2h3.18c.19.7.45 1.39.82 2H4v2h5.17c1.13 1.19 2.58 2 4.18 2H4a2 2 0 01-2-2v-8a2 2 0 012-2h10.17A7.919 7.919 0 008.82 12z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Free Games</h2>
          </div>
          <Link 
            href="/free-games" 
            className="text-white hover:text-gray-300 border border-white/30 px-4 py-2 rounded hover:bg-white/10"
            tabIndex={0}
            aria-label="View More Free Games"
          >
            View More
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freeGames.map((game) => (
            <div key={game.id} className="group">
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="relative h-48 md:h-64 w-full">
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
                <p className="text-sm text-gray-400">
                  {game.released ? `Released: ${new Date(game.released).toLocaleDateString()}` : "Available now"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreeGames; 