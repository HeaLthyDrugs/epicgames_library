"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getRawgApi, Game } from "../services/rawg-api";
import Link from "next/link";
import { useLibrary } from "../context/LibraryContext";
import PurchaseModal from "./PurchaseModal";
import { useRouter } from "next/navigation";

const DiscoverSection = () => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const [topGames, setTopGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { isGameInLibrary } = useLibrary();

  useEffect(() => {
    const fetchAllTimeTopGames = async () => {
      try {
        setLoading(true);
        const results: Game[] = [];
        const rawgApi = getRawgApi();

        // Fetch multiple pages to get at least 100 games
        // RAWG API typically limits to 40 per page
        for (let page = 1; page <= 3; page++) {
          const data = await fetch(
            `https://api.rawg.io/api/games?key=74141a61b1f2487d95045f4a9816c421&ordering=-metacritic&page=${page}&page_size=40`
          );
          const response = await data.json();
          
          if (response.results && response.results.length > 0) {
            results.push(...response.results);
          } else {
            break; // No more results
          }
        }

        setTopGames(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching all-time top games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTimeTopGames();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -800, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 800, behavior: "smooth" });
    }
  };

  const handleBuyGame = (game: Game) => {
    setSelectedGame(game);
    setShowPurchaseModal(true);
  };

  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
  };

  const handleGameClick = (game: Game) => {
    router.push(`/game/${game.slug}`);
  };

  const handleAddToWishlist = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation(); // Prevent navigating to game details
    // Add your wishlist functionality here
    console.log(`Added ${game.name} to wishlist`);
  };

  if (loading) {
    return (
      <section className="bg-[#121212] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">All-Time Top Games</h2>
          </div>
          <div className="flex justify-center py-12">
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
            <h2 className="text-2xl font-bold text-white">All-Time Top Games</h2>
          </div>
          <div className="flex justify-center py-12">
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
          <h2 className="text-2xl font-bold text-white flex items-center">
            Discover Something New
            <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </h2>
          <div className="flex space-x-2">
            <button 
              className={`p-2 rounded-full bg-gray-800 ${
                showLeftScroll ? "text-white" : "text-gray-600 cursor-not-allowed"
              }`}
              onClick={scrollLeft}
              disabled={!showLeftScroll}
              tabIndex={0}
              aria-label="Scroll left"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              className={`p-2 rounded-full bg-gray-800 ${
                showRightScroll ? "text-white" : "text-gray-600 cursor-not-allowed"
              }`}
              onClick={scrollRight}
              disabled={!showRightScroll}
              tabIndex={0}
              aria-label="Scroll right"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollRef} 
          className="flex space-x-6 overflow-x-auto no-scrollbar pb-4"
          onScroll={handleScroll}
        >
          {topGames.map((game) => (
            <div 
              key={game.id} 
              className="flex-shrink-0 w-80 group cursor-pointer"
              onClick={() => handleGameClick(game)}
              onKeyDown={(e) => e.key === 'Enter' && handleGameClick(game)}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${game.name}`}
            >
              <div className="relative h-44 w-full overflow-hidden rounded-xl">
                <Image
                  src={game.background_image || "https://placehold.co/600x400/121212/cccccc?text=No+Image"}
                  alt={game.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Add to wishlist button - visible on hover */}
                <button 
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  onClick={(e) => handleAddToWishlist(e, game)}
                  tabIndex={0}
                  aria-label={`Add ${game.name} to wishlist`}
                >
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#000" 
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                {/* {game.metacritic && (
                  <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white rounded ${
                    game.metacritic >= 90 ? 'bg-green-600' : 
                    game.metacritic >= 80 ? 'bg-green-700' : 
                    game.metacritic >= 70 ? 'bg-yellow-600' : 
                    game.metacritic >= 60 ? 'bg-orange-600' : 'bg-red-600'
                  }`}>
                    {game.metacritic}
                  </div>
                )} */}
              </div>
              <div className="p-4 rounded-b-lg">
                <span className="text-xs text-gray-400 block mb-1">
                  {game.genres && game.genres.length > 0 
                    ? game.genres.slice(0, 2).map(g => g.name).join(', ') 
                    : 'Base Game'}
                </span>
                <h3 className="text-base font-medium text-white mb-2 truncate">{game.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">
                  ₹2,999
                  </span>
                  <div className="flex space-x-2">
                  </div>
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

export default DiscoverSection; 