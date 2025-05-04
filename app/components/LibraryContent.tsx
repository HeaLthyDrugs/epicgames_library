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

  // Find featured games (either favorites or first 3 games)
  const featuredGames = favorites.length > 0 
    ? games.filter(game => favorites.includes(game.id)).slice(0, 3) 
    : games.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#1a1a1a]/50 backdrop-blur-md p-4 rounded-xl border border-[#2a2a2a]/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </span>
            <input
              type="search"
              className="pl-10 pr-4 py-2.5 w-full sm:w-[300px] bg-[#252525] border border-[#333333] rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              placeholder="Search your library"
              onChange={handleSearch}
              value={filters.search}
              tabIndex={0}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenShareModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-blue-900/20"
            tabIndex={0}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share Library
          </button>
        </div>
      </div>
      
      {/* Success Message */}
      {shareSuccess && (
        <div className="bg-green-800/30 backdrop-blur-md border border-green-700/50 text-green-100 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div>
              <p className="font-medium">Library shared successfully!</p>
              <p className="text-sm text-green-300 break-all">{shareSuccess}</p>
            </div>
          </div>
          <button 
            onClick={() => setShareSuccess(null)}
            className="text-green-300 hover:text-green-100"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Hero Section with Featured Games */}
      {featuredGames.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Featured Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGames.map((game) => {
              const isCurrentlyLent = isGameLent(game.id);
              
              return (
                <div 
                  key={`featured-${game.id}`} 
                  className="relative group overflow-hidden rounded-xl transition-all duration-300 shadow-xl hover:shadow-blue-900/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10"></div>
                  <div className="relative h-[260px]">
                    <Image
                      src={game.thumbnail}
                      alt={game.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <h3 className="text-white text-xl font-bold mb-1">{game.title}</h3>
                    <div className="flex justify-between text-sm text-gray-300 mb-3">
                      <span className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">{game.genre}</span>
                      <span className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">{game.platform}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleInstall(game.title)}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${
                          isCurrentlyLent ? 
                          "bg-blue-900/50 text-blue-200 cursor-not-allowed" : 
                          "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        disabled={isCurrentlyLent}
                        tabIndex={0}
                      >
                        {isCurrentlyLent ? "Lent" : "Install"}
                      </button>
                      <button
                        onClick={() => handleViewDetails(game)}
                        className="flex-1 bg-[#ffffff20] hover:bg-[#ffffff30] text-white py-2 px-3 rounded text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                        tabIndex={0}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(game.id)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-20 ${
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
                    <div className="absolute top-3 left-3 bg-blue-600/80 backdrop-blur-sm text-white py-1 px-3 rounded-full text-xs font-medium z-20">
                      Currently Lent
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <div className="border-b border-[#333333] mb-6">
        <div className="flex overflow-x-auto hide-scrollbar space-x-6">
          <button 
            onClick={() => handleFilterChange("status", "All")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              filters.status === "All" 
                ? "border-blue-500 text-blue-500" 
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            All Games
          </button>
          <button 
            onClick={() => handleFilterChange("status", "Favorites")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center ${
              filters.status === "Favorites" 
                ? "border-yellow-500 text-yellow-500" 
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <svg className={`w-4 h-4 mr-1.5 ${filters.status === "Favorites" ? "text-yellow-500" : "text-gray-400"}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Favorites
          </button>
          <button 
            onClick={() => handleFilterChange("status", "Lent")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center ${
              filters.status === "Lent" 
                ? "border-blue-500 text-blue-500" 
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <svg className={`w-4 h-4 mr-1.5 ${filters.status === "Lent" ? "text-blue-500" : "text-gray-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
            Lent Games
          </button>
          {genres.filter(g => g !== "All").map(genre => (
            <button 
              key={genre}
              onClick={() => handleFilterChange("genre", genre)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                filters.genre === genre 
                  ? "border-purple-500 text-purple-500" 
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              {genre}
            </button>
          ))}
          {platforms.filter(p => p !== "All").map(platform => (
            <button 
              key={platform}
              onClick={() => handleFilterChange("platform", platform)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                filters.platform === platform 
                  ? "border-green-500 text-green-500" 
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Shared Libraries Section */}
      {mySharedLibraries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            My Shared Libraries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySharedLibraries.map((library) => (
              <div 
                key={library.id} 
                className="bg-gradient-to-br from-[#202025] to-[#1a1a20] rounded-xl overflow-hidden border border-[#2a2a2a]/50 hover:border-blue-900/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5"
              >
                <div className="p-5">
                  <h3 className="text-white text-lg font-semibold mb-1 flex items-center">
                    {library.title}
                    <span className="ml-2 text-xs font-normal bg-blue-900/30 text-blue-200 py-0.5 px-2 rounded-full">
                      {library.games.length} games
                    </span>
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">Created {new Date(library.createdAt).toLocaleDateString()}</p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleViewSharedLibrary(library.id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                      tabIndex={0}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteSharedLibrary(library.id)}
                      className="flex-none bg-[#333333] hover:bg-[#444444] text-white p-2 rounded-lg text-sm transition-colors"
                      tabIndex={0}
                      aria-label="Delete library"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
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
      
      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            {
              filters.status === "All" && filters.genre === "All" && filters.platform === "All" && !filters.search
                ? "All Games"
                : "Filtered Games"
            }
            <span className="ml-2 text-sm font-normal text-gray-400">({filteredGames.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filteredGames.map((game) => {
              const isCurrentlyLent = isGameLent(game.id);
              
              return (
                <div 
                  key={game.id} 
                  className="bg-gradient-to-br from-[#202025] to-[#1a1a20] rounded-xl overflow-hidden border border-[#2a2a2a]/50 hover:border-blue-900/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5 group"
                >
                  <div className="relative h-44">
                    <Image
                      src={game.thumbnail}
                      alt={game.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      onClick={() => toggleFavorite(game.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
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
                      <div className="absolute top-3 left-3 bg-blue-600/80 backdrop-blur-sm text-white py-1 px-3 rounded-full text-xs font-medium">
                        Currently Lent
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-white text-base font-semibold mb-1 truncate">{game.title}</h3>
                    <div className="flex justify-between text-xs text-gray-400 mb-3">
                      <span className="bg-[#ffffff10] rounded-full px-2.5 py-1">{game.genre}</span>
                      <span className="bg-[#ffffff10] rounded-full px-2.5 py-1">{game.platform}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleInstall(game.title)}
                        className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-colors ${
                          isCurrentlyLent ? 
                          "bg-blue-900/50 text-blue-200 cursor-not-allowed" : 
                          "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        tabIndex={0}
                        disabled={isCurrentlyLent}
                      >
                        {isCurrentlyLent ? "Lent" : "Install"}
                      </button>
                      <button
                        onClick={() => handleViewDetails(game)}
                        className="flex-1 bg-[#333333] hover:bg-[#444444] text-white py-2 px-3 rounded text-xs font-medium transition-colors"
                        tabIndex={0}
                      >
                        Details
                      </button>
                      
                      <button
                        onClick={() => handleLendGame(game)}
                        className={`flex-none bg-[#333333] hover:bg-[#444444] text-white p-2 rounded text-xs transition-colors ${
                          isCurrentlyLent ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
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
        </div>
      ) : (
        <div className="bg-[#1a1a1a]/60 backdrop-blur-md rounded-xl p-8 text-center border border-[#2a2a2a]/50">
          <div className="max-w-md mx-auto">
            <div className="bg-[#ffffff08] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <p className="text-gray-300 text-lg font-medium mb-2">No games found</p>
            {games.length === 0 ? (
              <div className="flex flex-col items-center">
                <p className="text-gray-500 mb-6">Your library is empty. Purchase games to see them here.</p>
                <button 
                  onClick={() => window.location.href = '/store'} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-5 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                <button 
                  onClick={() => setFilters({genre: "All", platform: "All", status: "All", search: ""})} 
                  className="bg-[#333333] hover:bg-[#444444] text-white py-2.5 px-5 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Preview Modal */}
      {showModal && selectedGame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#202025] to-[#1a1a20] rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#2a2a2a]/50 shadow-2xl animate-fade-in">
            <div className="relative h-60 sm:h-80">
              <Image
                src={selectedGame.thumbnail}
                alt={selectedGame.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a20] via-transparent to-transparent"></div>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition-colors"
                aria-label="Close modal"
                tabIndex={0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-white text-2xl font-bold">{selectedGame.title}</h2>
                <button
                  onClick={() => toggleFavorite(selectedGame.id)}
                  className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                    favorites.includes(selectedGame.id) ? "text-yellow-500" : "text-gray-400 hover:text-white"
                  }`}
                  aria-label={favorites.includes(selectedGame.id) ? "Remove from favorites" : "Add to favorites"}
                  tabIndex={0}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={favorites.includes(selectedGame.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-[#ffffff15] text-white text-sm px-3 py-1 rounded-full">{selectedGame.genre}</span>
                <span className="bg-[#ffffff15] text-white text-sm px-3 py-1 rounded-full">{selectedGame.platform}</span>
                {selectedGame.playtime && (
                  <span className="bg-[#ffffff15] text-white text-sm px-3 py-1 rounded-full flex items-center">
                    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {selectedGame.playtime}
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-white text-lg font-medium mb-2">About</h3>
                <p className="text-gray-300">{selectedGame.description}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    handleInstall(selectedGame.title);
                    closeModal();
                  }}
                  className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                    isGameLent(selectedGame.id) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  tabIndex={0}
                  disabled={isGameLent(selectedGame.id)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  {isGameLent(selectedGame.id) ? "Currently Lent" : "Install Game"}
                </button>
                
                {!isGameLent(selectedGame.id) && (
                  <button
                    onClick={() => {
                      handleLendGame(selectedGame);
                      closeModal();
                    }}
                    className="bg-[#333333] hover:bg-[#444444] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    tabIndex={0}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
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