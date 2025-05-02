"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLibrary } from "../context/LibraryContext";
import { Game } from "../services/rawg-api";
import { GameDisplay } from "../types/game";
import ShareLibraryModal from "./ShareLibraryModal";
import LendGameModal from "./LendGameModal";
import LentGamesSection from "./LentGamesSection";
import { SharedLibrary } from "./ShareLibraryModal";
import SharedLibraryView from "./SharedLibraryView";

type Filters = {
  genre: string;
  platform: string;
  status: string;
  search: string;
};

const LibraryContent = () => {
  const [games, setGames] = useState<GameDisplay[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameDisplay[]>([]);
  const [filters, setFilters] = useState<Filters>({
    genre: "All",
    platform: "All",
    status: "All",
    search: "",
  });
  const [selectedGame, setSelectedGame] = useState<GameDisplay | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLendModal, setShowLendModal] = useState(false);
  const [gameToLend, setGameToLend] = useState<GameDisplay | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [activeSharedLibraryId, setActiveSharedLibraryId] = useState<string | null>(null);
  const [mySharedLibraries, setMySharedLibraries] = useState<SharedLibrary[]>([]);
  
  // Get context data
  const { 
    purchasedGames, 
    lentGames, 
    lendGame, 
    revokeLentGame, 
    extendLentGame, 
    isGameLent,
    sharedLibraries,
    createSharedLibrary,
    deleteSharedLibrary,
    convertToGameDisplay
  } = useLibrary();

  // Initialize games and favorites from local storage
  useEffect(() => {
    // Convert purchased RAWG games to display format first
    const purchasedDisplayGames: GameDisplay[] = purchasedGames.map(game => convertToGameDisplay(game));

    // Only add demo games if there are no purchased games
    const staticGames: GameDisplay[] = purchasedDisplayGames.length === 0 ? [
      {
        id: 1,
        title: "Fortnite",
        thumbnail: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?q=80&w=1374&auto=format&fit=crop",
        genre: "Battle Royale",
        platform: "PC",
        description: "A free-to-play battle royale game with vibrant graphics and cross-platform play. Build structures, collect weapons, and be the last one standing.",
        playtime: "120 hours"
      },
      {
        id: 2,
        title: "Rocket League",
        thumbnail: "https://images.unsplash.com/photo-1509105494475-358d372e6ade?q=80&w=1374&auto=format&fit=crop",
        genre: "Sports",
        platform: "PC",
        description: "A high-powered hybrid of arcade soccer and vehicular mayhem. Customize your car, hit the field, and compete in one of the most critically acclaimed sports games of all time.",
        playtime: "85 hours"
      }
    ] : [];

    // Set all games
    setGames([...staticGames, ...purchasedDisplayGames]);
    
    const storedFavorites = localStorage.getItem("epicGamesFavorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    // Set my shared libraries
    setMySharedLibraries(sharedLibraries);
  }, [purchasedGames, sharedLibraries, convertToGameDisplay]);

  // Apply filters whenever filters or games change
  useEffect(() => {
    let result = [...games];

    // Apply genre filter
    if (filters.genre !== "All") {
      result = result.filter((game) => game.genre === filters.genre);
    }

    // Apply platform filter
    if (filters.platform !== "All") {
      result = result.filter((game) => game.platform === filters.platform);
    }

    // Apply status filter
    if (filters.status === "Favorites") {
      result = result.filter((game) => favorites.includes(game.id));
    } else if (filters.status === "Lent") {
      result = result.filter((game) => isGameLent(game.id));
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((game) => 
        game.title.toLowerCase().includes(searchLower)
      );
    }

    setFilteredGames(result);
  }, [filters, games, favorites, isGameLent]);

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  const handleViewDetails = (game: GameDisplay) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  const toggleFavorite = (gameId: number) => {
    const newFavorites = favorites.includes(gameId)
      ? favorites.filter((id) => id !== gameId)
      : [...favorites, gameId];
    
    setFavorites(newFavorites);
    localStorage.setItem("epicGamesFavorites", JSON.stringify(newFavorites));
  };

  const handleInstall = (gameTitle: string) => {
    alert(`Launching Epic Games Launcher for ${gameTitle}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGame(null);
  };

  const handleOpenShareModal = () => {
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const handleShareLibrary = (sharedLibrary: SharedLibrary) => {
    createSharedLibrary(sharedLibrary);
    
    // Generate a sharable URL (simulated for this exercise)
    const shareUrl = `${window.location.origin}/library/shared/${sharedLibrary.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShareSuccess(shareUrl);
        setTimeout(() => setShareSuccess(null), 5000);
      })
      .catch(err => {
        console.error("Could not copy to clipboard", err);
        setShareSuccess(shareUrl); // Still show the URL
      });
  };

  const handleLendGame = (game: GameDisplay) => {
    setGameToLend(game);
    setShowLendModal(true);
  };

  const handleCloseLendModal = () => {
    setShowLendModal(false);
    setGameToLend(null);
  };

  const handleLendSubmit = (gameId: number, friendName: string, email: string, duration: number) => {
    lendGame(gameId, friendName, email, duration);
  };

  const handleRevokeLent = (lentGameId: string) => {
    if (confirm("Are you sure you want to revoke access to this game?")) {
      revokeLentGame(lentGameId);
    }
  };

  const handleExtendLending = (lentGameId: string, additionalDays: number) => {
    extendLentGame(lentGameId, additionalDays);
  };

  const handleViewSharedLibrary = (id: string) => {
    setActiveSharedLibraryId(id);
  };

  const handleDeleteSharedLibrary = (id: string) => {
    if (confirm("Are you sure you want to delete this shared library?")) {
      deleteSharedLibrary(id);
    }
  };

  const handleCloseSharedView = () => {
    setActiveSharedLibraryId(null);
  };

  // Get formated lent games data
  const formattedLentGames = lentGames.map(lentGame => {
    const game = games.find(g => g.id === lentGame.gameId);
    
    if (!game) return null;
    
    const now = new Date();
    const expiryDate = new Date(lentGame.expiryDate);
    
    return {
      gameId: lentGame.gameId,
      id: lentGame.id,
      game,
      friendName: lentGame.friendName,
      email: lentGame.email,
      lendDate: lentGame.lendDate,
      expiryDate: lentGame.expiryDate,
      duration: lentGame.duration,
      isExpired: expiryDate < now
    };
  }).filter(Boolean) as {
    gameId: number;
    id: string;
    game: GameDisplay;
    friendName: string;
    email: string;
    lendDate: string;
    expiryDate: string;
    duration: number;
    isExpired: boolean;
  }[];

  // Get unique genre and platform values for filters
  const genres = ["All", ...new Set(games.map((game) => game.genre))];
  const platforms = ["All", ...new Set(games.map((game) => game.platform))];

  // If viewing a shared library
  if (activeSharedLibraryId) {
    return <SharedLibraryView sharedLibraryId={activeSharedLibraryId} onClose={handleCloseSharedView} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Library</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleOpenShareModal}
            className="bg-[#333333] hover:bg-[#444444] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
            tabIndex={0}
          >
            Share Library
          </button>
        </div>
      </div>
      
      {/* Success Message */}
      {shareSuccess && (
        <div className="bg-green-700/70 border border-green-500 text-white px-4 py-3 rounded mb-6 flex justify-between items-center">
          <div>
            <p className="font-bold">Library shared successfully!</p>
            <p className="text-sm">Share link: {shareSuccess}</p>
          </div>
          <button
            onClick={() => setShareSuccess(null)}
            className="text-white"
            aria-label="Close notification"
            tabIndex={0}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
      
      {/* Shared Libraries Section */}
      {mySharedLibraries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">My Shared Libraries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySharedLibraries.map((library) => (
              <div key={library.id} className="bg-[#202020] rounded-lg overflow-hidden">
                <div className="p-4">
                  <h3 className="text-white text-lg font-semibold mb-1">{library.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{library.games.length} games • Created {new Date(library.createdAt).toLocaleDateString()}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewSharedLibrary(library.id)}
                      className="flex-1 bg-[#0074e4] hover:bg-[#0066cc] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                      tabIndex={0}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteSharedLibrary(library.id)}
                      className="flex-1 bg-[#333333] hover:bg-[#444444] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                      tabIndex={0}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Lent Games Section */}
      {formattedLentGames.length > 0 && (
        <LentGamesSection 
          lentGames={formattedLentGames}
          onRevoke={handleRevokeLent}
          onExtend={handleExtendLending}
        />
      )}
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-4">
          {/* Genre Filter */}
          <div className="min-w-[150px]">
            <label htmlFor="genre-filter" className="block text-sm font-medium text-gray-400 mb-1">
              Genre
            </label>
            <select
              id="genre-filter"
              className="bg-[#202020] text-white text-sm rounded-lg block w-full p-2.5 border border-[#333333] focus:ring-blue-500 focus:border-blue-500"
              value={filters.genre}
              onChange={(e) => handleFilterChange("genre", e.target.value)}
              tabIndex={0}
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
          
          {/* Platform Filter */}
          <div className="min-w-[150px]">
            <label htmlFor="platform-filter" className="block text-sm font-medium text-gray-400 mb-1">
              Platform
            </label>
            <select
              id="platform-filter"
              className="bg-[#202020] text-white text-sm rounded-lg block w-full p-2.5 border border-[#333333] focus:ring-blue-500 focus:border-blue-500"
              value={filters.platform}
              onChange={(e) => handleFilterChange("platform", e.target.value)}
              tabIndex={0}
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="min-w-[150px]">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-400 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              className="bg-[#202020] text-white text-sm rounded-lg block w-full p-2.5 border border-[#333333] focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              tabIndex={0}
            >
              <option value="All">All</option>
              <option value="Favorites">Favorites</option>
              <option value="Lent">Lent Games</option>
            </select>
          </div>
        </div>
        
        {/* Search */}
        <div className="min-w-[300px]">
          <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="search"
              id="search"
              className="block w-full p-2.5 pl-10 bg-[#202020] border border-[#333333] rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search your library"
              onChange={handleSearch}
              value={filters.search}
              tabIndex={0}
            />
          </div>
        </div>
      </div>
      
      {/* Game Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => {
            const isCurrentlyLent = isGameLent(game.id);
            
            return (
              <div 
                key={game.id} 
                className="bg-[#202020] rounded-lg overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1"
              >
                <div className="relative h-48">
                  <Image
                    src={game.thumbnail}
                    alt={game.title}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(game.id)}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      favorites.includes(game.id) ? "bg-yellow-600 text-white" : "bg-black/50 text-white hover:bg-black/70"
                    }`}
                    aria-label={favorites.includes(game.id) ? "Remove from favorites" : "Add to favorites"}
                    tabIndex={0}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.includes(game.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                  
                  {isCurrentlyLent && (
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-900/80 text-white py-1 px-3 text-xs">
                      Currently Lent
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white text-lg font-semibold mb-2">{game.title}</h3>
                  <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span>{game.genre}</span>
                    <span>{game.platform}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleInstall(game.title)}
                      className="flex-1 bg-[#0074e4] hover:bg-[#0066cc] text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                      tabIndex={0}
                      disabled={isCurrentlyLent}
                    >
                      {isCurrentlyLent ? "Lent" : "Install"}
                    </button>
                    <button
                      onClick={() => handleViewDetails(game)}
                      className="flex-1 bg-[#333333] hover:bg-[#444444] text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                      tabIndex={0}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleLendGame(game)}
                      className="flex-none bg-[#333333] hover:bg-[#444444] text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                      tabIndex={0}
                      disabled={isCurrentlyLent}
                      aria-label="Lend to friend"
                      title={isCurrentlyLent ? "Game is currently lent" : "Lend to friend"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <polyline points="17 11 19 13 23 9"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#202020] rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg mb-2">No games found</p>
          {games.length === 0 ? (
            <div className="flex flex-col items-center">
              <p className="text-gray-500 mb-4">Your library is empty. Purchase games to see them here.</p>
              <Image
                src="/images/purchase-success.svg"
                alt="Empty library"
                width={60}
                height={60}
                className="opacity-40 mb-4"
              />
            </div>
          ) : (
            <p className="text-gray-500">Try adjusting your search or filters</p>
          )}
        </div>
      )}
      
      {/* Preview Modal */}
      {showModal && selectedGame && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div 
            className="bg-[#202020] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex md:flex-row flex-col">
              <div className="md:w-1/2 relative h-[400px] md:h-[600px]">
                <Image
                  src={selectedGame.thumbnail}
                  alt={selectedGame.title}
                  fill
                  className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                />
              </div>
              <div className="md:w-1/2 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white">{selectedGame.title}</h2>
                  <button 
                    className="text-gray-400 hover:text-gray-300"
                    onClick={closeModal}
                    aria-label="Close modal"
                    tabIndex={0}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>{selectedGame.genre}</span>
                  <span>{selectedGame.platform}</span>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-gray-300 text-lg mb-2">Description</h3>
                  <p className="text-gray-400">{selectedGame.description}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-gray-300 text-lg mb-2">Playtime</h3>
                  <p className="text-gray-400">{selectedGame.playtime}</p>
                </div>
                
                <div className="mt-auto flex space-x-4">
                  <button
                    onClick={() => {
                      handleInstall(selectedGame.title);
                      closeModal();
                    }}
                    className="flex-1 bg-[#0074e4] hover:bg-[#0066cc] text-white py-3 px-4 rounded font-medium transition-colors"
                    tabIndex={0}
                    disabled={isGameLent(selectedGame.id)}
                  >
                    {isGameLent(selectedGame.id) ? "Game is Lent" : "Install"}
                  </button>
                  <button
                    onClick={() => toggleFavorite(selectedGame.id)}
                    className={`px-4 py-3 rounded font-medium transition-colors ${
                      favorites.includes(selectedGame.id)
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                        : "bg-[#333333] hover:bg-[#444444] text-white"
                    }`}
                    tabIndex={0}
                  >
                    {favorites.includes(selectedGame.id) ? "Remove from Favorites" : "Add to Favorites"}
                  </button>
                </div>
                
                {!isGameLent(selectedGame.id) && (
                  <button
                    onClick={() => {
                      handleLendGame(selectedGame);
                      closeModal();
                    }}
                    className="mt-3 bg-[#333333] hover:bg-[#444444] text-white py-3 px-4 rounded font-medium transition-colors flex items-center justify-center"
                    tabIndex={0}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <polyline points="17 11 19 13 23 9"></polyline>
                    </svg>
                    Lend to a Friend
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Library Modal */}
      <ShareLibraryModal 
        games={games}
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
        onShare={handleShareLibrary}
      />
      
      {/* Lend Game Modal */}
      {gameToLend && (
        <LendGameModal
          game={gameToLend}
          isOpen={showLendModal}
          onClose={handleCloseLendModal}
          onLend={handleLendSubmit}
        />
      )}
    </div>
  );
};

export default LibraryContent; 