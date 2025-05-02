"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { GameDisplay } from "../types/game";
import { SharedLibrary } from "./ShareLibraryModal";

type SharedLibraryViewProps = {
  sharedLibraryId: string;
  onClose: () => void;
};

type RecommendedGame = {
  gameId: number;
  gameName: string;
  recommendedBy: string;
  date: string;
};

const SharedLibraryView = ({ sharedLibraryId, onClose }: SharedLibraryViewProps) => {
  const [library, setLibrary] = useState<SharedLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredGames, setFilteredGames] = useState<GameDisplay[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameDisplay | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    genre: "All",
    platform: "All",
    search: "",
  });
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendedGameName, setRecommendedGameName] = useState("");
  const [visitorName, setVisitorName] = useState("");

  // Load shared library from localStorage
  useEffect(() => {
    setLoading(true);
    try {
      const sharedLibraries = JSON.parse(localStorage.getItem("epicGamesSharedLibraries") || "[]");
      const found = sharedLibraries.find((lib: SharedLibrary) => lib.id === sharedLibraryId);
      
      if (found) {
        setLibrary(found);
        setFilteredGames(found.games);
      } else {
        setError("Shared library not found or has expired");
      }
    } catch (err) {
      setError("Failed to load shared library");
    } finally {
      setLoading(false);
    }
  }, [sharedLibraryId]);

  // Apply filters whenever they change
  useEffect(() => {
    if (!library) return;
    
    let result = [...library.games];

    // Apply genre filter
    if (filters.genre !== "All") {
      result = result.filter((game) => game.genre === filters.genre);
    }

    // Apply platform filter
    if (filters.platform !== "All") {
      result = result.filter((game) => game.platform === filters.platform);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((game) => 
        game.title.toLowerCase().includes(searchLower)
      );
    }

    setFilteredGames(result);
  }, [filters, library]);

  const handleFilterChange = (filterType: "genre" | "platform", value: string) => {
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

  const closeModal = () => {
    setShowModal(false);
    setSelectedGame(null);
  };

  const handleRecommendGame = () => {
    if (!recommendedGameName.trim() || !visitorName.trim()) return;
    
    // Get existing recommendations or initialize empty array
    const recommendations: RecommendedGame[] = JSON.parse(
      localStorage.getItem(`epicGamesRecommendations_${sharedLibraryId}`) || "[]"
    );
    
    // Add new recommendation
    const newRecommendation: RecommendedGame = {
      gameId: Date.now(), // Using timestamp as a simple unique ID
      gameName: recommendedGameName,
      recommendedBy: visitorName,
      date: new Date().toISOString(),
    };
    
    // Save updated recommendations
    localStorage.setItem(
      `epicGamesRecommendations_${sharedLibraryId}`,
      JSON.stringify([...recommendations, newRecommendation])
    );
    
    // Close modal and reset form
    setShowRecommendModal(false);
    setRecommendedGameName("");
    setVisitorName("");
    
    // Show confirmation
    alert(`Thank you! Your game recommendation has been sent.`);
  };

  // Get unique genre and platform values for filters
  const genres = library ? ["All", ...new Set(library.games.map((game) => game.genre))] : ["All"];
  const platforms = library ? ["All", ...new Set(library.games.map((game) => game.platform))] : ["All"];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#121212] flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading shared library...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#121212] flex flex-col items-center justify-center z-50 p-4">
        <div className="text-white text-xl mb-4">{error}</div>
        <button
          onClick={onClose}
          className="bg-[#0074e4] hover:bg-[#0066cc] text-white py-2 px-6 rounded text-sm font-medium"
          tabIndex={0}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!library) return null;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="relative bg-[#202020] py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-400 mb-1">Shared Library</div>
            <h1 className="text-2xl font-bold text-white">{library.title}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRecommendModal(true)}
              className="bg-[#333333] hover:bg-[#444444] text-white py-2 px-4 rounded text-sm font-medium"
              tabIndex={0}
            >
              Recommend Game
            </button>
            <button
              onClick={onClose}
              className="bg-[#0074e4] hover:bg-[#0066cc] text-white py-2 px-4 rounded text-sm font-medium"
              tabIndex={0}
            >
              Exit Shared View
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                placeholder="Search games"
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
            {filteredGames.map((game) => (
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
                </div>
                <div className="p-4">
                  <h3 className="text-white text-lg font-semibold mb-2">{game.title}</h3>
                  <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span>{game.genre}</span>
                    <span>{game.platform}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(game)}
                      className="w-full bg-[#333333] hover:bg-[#444444] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                      tabIndex={0}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#202020] rounded-lg p-8 text-center">
            <p className="text-gray-400 text-lg mb-2">No games found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      
      {/* Game Details Modal */}
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
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recommend Game Modal */}
      {showRecommendModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowRecommendModal(false)}>
          <div 
            className="bg-[#202020] rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Recommend a Game</h2>
              <button 
                className="text-gray-400 hover:text-gray-300"
                onClick={() => setShowRecommendModal(false)}
                aria-label="Close modal"
                tabIndex={0}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="visitor-name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="visitor-name"
                  className="bg-[#333333] text-white text-sm rounded-lg block w-full p-2.5 border border-[#444444] focus:ring-blue-500 focus:border-blue-500"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={50}
                  tabIndex={0}
                />
              </div>
              
              <div>
                <label htmlFor="game-recommendation" className="block text-sm font-medium text-gray-300 mb-2">
                  Game Recommendation
                </label>
                <input
                  type="text"
                  id="game-recommendation"
                  className="bg-[#333333] text-white text-sm rounded-lg block w-full p-2.5 border border-[#444444] focus:ring-blue-500 focus:border-blue-500"
                  value={recommendedGameName}
                  onChange={(e) => setRecommendedGameName(e.target.value)}
                  placeholder="Enter game title"
                  maxLength={100}
                  tabIndex={0}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowRecommendModal(false)}
                  className="bg-[#333333] hover:bg-[#444444] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                  tabIndex={0}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecommendGame}
                  className="bg-[#0074e4] hover:bg-[#0066cc] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                  tabIndex={0}
                  disabled={!recommendedGameName.trim() || !visitorName.trim()}
                >
                  Send Recommendation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedLibraryView; 