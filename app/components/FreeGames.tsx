"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRawgApi, Game } from "../services/rawg-api";
import { useRouter } from "next/navigation";
import PurchaseModal from "./PurchaseModal";
import { useLibrary } from "../context/LibraryContext";

// Extend Game type with our additional properties
interface FreeGame extends Game {
  status: string;
  dateRange: string;
}

// Mock game data to use as fallback
const mockGames: Game[] = [
  {
    id: 1001,
    name: "Ghost of Tsushima",
    background_image: "https://media.rawg.io/media/games/f24/f2493ea338fe7bd3c7d73750a85a9416.jpg",
    slug: "ghost-of-tsushima",
    rating: 4.5,
    ratings_count: 2000,
    released: "2020-07-17",
    platforms: [{ platform: { id: 1, name: "PlayStation" } }],
    genres: [{ id: 1, name: "Action" }, { id: 2, name: "Adventure" }]
  },
  {
    id: 1002,
    name: "Grand Theft Auto VI",
    background_image: "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
    slug: "grand-theft-auto-vi",
    rating: 4.8,
    ratings_count: 1500,
    released: "2025-01-01",
    platforms: [{ platform: { id: 2, name: "PlayStation" } }, { platform: { id: 3, name: "Xbox" } }],
    genres: [{ id: 3, name: "Action" }, { id: 4, name: "Open World" }]
  },
  {
    id: 1003,
    name: "God of War Ragnarök",
    background_image: "https://media.rawg.io/media/games/6ac/6ac602fba4f776a954b5d13a9c4183fd.jpg",
    slug: "god-of-war-ragnarok",
    rating: 4.9,
    ratings_count: 3000,
    released: "2022-11-09",
    platforms: [{ platform: { id: 1, name: "PlayStation" } }],
    genres: [{ id: 1, name: "Action" }, { id: 5, name: "Adventure" }]
  }
];

const FreeGames = () => {
  const router = useRouter();
  const [freeGames, setFreeGames] = useState<FreeGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<FreeGame | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { isGameInLibrary } = useLibrary();

  // Game slugs as specified
  const gamesList = [
    "ghost-of-tsushima",
    "grand-theft-auto-vi",
    "god-of-war-ragnarok",
  ];

  useEffect(() => {
    const fetchFreeGames = async () => {
      try {
        setLoading(true);
        const rawgApi = getRawgApi();
        
        // Use searchGames instead of the non-existent getGamesBySlugArray
        const fetchedGames: Game[] = [];
        
        // Create an array of promises for each game slug
        const gamePromises = gamesList.map(async (slug, index) => {
          try {
            // Search for the game by its slug
            console.log(`Searching for game with slug: ${slug}`);
            const results = await rawgApi.searchGames(slug, 5);
            
            // Try to find exact or partial match
            const exactMatch = results.find(game => game.slug === slug);
            const partialMatch = results.find(game => game.slug.includes(slug) || slug.includes(game.slug));
            
            const game = exactMatch || partialMatch;
            
            if (game) {
              console.log(`Found game: ${game.name} with id: ${game.id}`);
              fetchedGames.push(game);
            } else {
              console.log(`No game found for slug: ${slug}, using mock data`);
              // Use mock data if no game is found
              const mockGame = mockGames.find(g => g.slug === slug || g.slug.includes(slug));
              if (mockGame) {
                fetchedGames.push(mockGame);
              }
            }
          } catch (err) {
            console.error(`Error searching for game ${slug}:`, err);
            // Use mock data on error
            const mockGame = mockGames.find(g => g.slug === slug || g.slug.includes(slug));
            if (mockGame) {
              fetchedGames.push(mockGame);
            }
          }
        });
        
        // Wait for all promises to resolve
        await Promise.all(gamePromises);
        
        console.log(`Fetched ${fetchedGames.length} games`);
        
        // If no games were found, use mock data
        if (fetchedGames.length === 0) {
          console.log("No games found from API, using full mock data");
          // Use at most 3 mock games
          const mocksToUse = mockGames.slice(0, 3);
          setFreeGames(mocksToUse.map((game, index) => ({
            ...game,
            status: index === 0 ? "FREE NOW" : "COMING SOON",
            dateRange: index === 0 
              ? `Free Now - ${new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}` 
              : "Free by May 26 2026"
          })));
        } else {
          // Manually override the status for our fetched games
          const gamesWithInfo = fetchedGames.map((game, index) => {
            return {
              ...game,
              // Set status based on the index - first game is FREE NOW, others are COMING SOON
              status: index === 0 ? "FREE NOW" : "COMING SOON",
              dateRange: index === 0 
                ? `Free Now - ${new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}` 
                : "Free by May 26 2025 🥲"
            };
          }) as FreeGame[];
          
          setFreeGames(gamesWithInfo);
        }
      } catch (err) {
        console.error("Error in fetchFreeGames:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        
        // Fallback to mock data
        setFreeGames(mockGames.slice(0, 3).map((game, index) => ({
          ...game,
          status: index === 0 ? "FREE NOW" : "COMING SOON",
          dateRange: index === 0 
            ? `Free Now - ${new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}` 
            : "Free by May 26 2025 🥲"
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchFreeGames();
  }, []);

  const handleGameClick = (game: FreeGame) => {
    setSelectedGame(game);
    setShowPurchaseModal(true);
  };

  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
  };

  if (loading) {
    return (
      <section className="bg-[#121212] py-16">
        <div className="max-w-7xl mx-auto rounded-2xl px-4 sm:px-6 lg:p-10 bg-[#202024]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-white mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
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
        <div className="max-w-7xl mx-auto rounded-2xl px-4 sm:px-6 lg:p-10 bg-[#202024]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-white mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
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
    <section className="bg-[#121212] py-8">
      <div className="max-w-7xl mx-auto rounded-2xl px-4 sm:px-6 lg:p-10 bg-[#202024]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            {/* Gift icon */}
            <svg className="w-6 h-6 text-white mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 012-2h4V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2h4a2 2 0 012 2M6 12v8h12v-8H6zm8-4V8h-4v2h4z"/>
            </svg>
            <h2 className="text-2xl font-bold text-white">Free Games</h2>
          </div>
          <Link 
            href="/free-games" 
            className="text-white hover:text-gray-300 border border-white/30 px-4 py-2 rounded hover:bg-white/10 transition-colors"
            tabIndex={0}
            aria-label="View more free games"
          >
            View More
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freeGames.map((game, index) => (
            <div 
              key={game.id} 
              className="group cursor-pointer"
              onClick={() => handleGameClick(game)}
              onKeyDown={(e) => e.key === 'Enter' && handleGameClick(game)}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${game.name}`}
            >
              <div className="bg-transparent">
                <div className="relative w-full rounded-lg overflow-hidden" style={{ height: "220px" }}>
                  <Image
                    src={game.background_image || "/placeholder-game.jpg"}
                    alt={game.name}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 w-full">
                    <div 
                      className={`w-full px-4 py-2 text-center uppercase tracking-wider font-bold text-sm text-white 
                        ${index === 0 ? 'bg-blue-600' : 'bg-[#313131]'}`}
                    >
                      {game.status}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {game.dateRange}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedGame && (
        <PurchaseModal 
          game={selectedGame} 
          onClose={handleClosePurchaseModal}
        />
      )}
    </section>
  );
};

export default FreeGames; 