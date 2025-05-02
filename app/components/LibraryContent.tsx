"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Use dynamic import to properly handle the JSON data
type Game = {
  id: number;
  title: string;
  thumbnail: string;
  genre: string;
  platform: string;
  description: string;
  playtime: string;
};

// We'll load the games data in useEffect
const gamesData: Game[] = [
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
  },
  {
    id: 3,
    title: "The Witcher 3",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1470&auto=format&fit=crop",
    genre: "RPG",
    platform: "PC",
    description: "An epic role-playing game set in a vast open world. Play as Geralt of Rivia, a monster hunter known as a Witcher who is looking for his missing adopted daughter.",
    playtime: "150 hours"
  },
  {
    id: 4,
    title: "Fall Guys",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1470&auto=format&fit=crop",
    genre: "Battle Royale",
    platform: "PC",
    description: "A massively multiplayer party game with up to 60 players online in a free-for-all struggle through rounds of escalating chaos until one victor remains.",
    playtime: "45 hours"
  },
  {
    id: 5,
    title: "Civilization VI",
    thumbnail: "https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?q=80&w=1471&auto=format&fit=crop",
    genre: "Strategy",
    platform: "PC",
    description: "A turn-based strategy game in which you attempt to build an empire to stand the test of time. Become Ruler of the World by establishing and leading a civilization from the Stone Age to the Information Age.",
    playtime: "200 hours"
  },
  {
    id: 6,
    title: "Among Us",
    thumbnail: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=1470&auto=format&fit=crop",
    genre: "Social Deduction",
    platform: "PC",
    description: "An online and local party game of teamwork and betrayal. Crewmates work together to complete tasks before one or more Impostors can kill everyone aboard.",
    playtime: "30 hours"
  },
  {
    id: 7,
    title: "Control",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1470&auto=format&fit=crop",
    genre: "Action",
    platform: "PC",
    description: "A supernatural third-person action-adventure game. After a secretive agency in New York is invaded by an otherworldly threat, you become the Director struggling to regain control.",
    playtime: "25 hours"
  },
  {
    id: 8,
    title: "GTA V",
    thumbnail: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1470&auto=format&fit=crop",
    genre: "Action",
    platform: "PC",
    description: "An action-adventure game set in the sprawling city of Los Santos. Follow three criminals as they commit heists and try to survive in a fictional city filled with adventure.",
    playtime: "95 hours"
  },
  {
    id: 9,
    title: "Hades",
    thumbnail: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1374&auto=format&fit=crop",
    genre: "Action",
    platform: "PC",
    description: "A god-like rogue-like dungeon crawler that combines the best aspects of Supergiant's critically acclaimed titles. Battle out of hell in a hack and slash adventure.",
    playtime: "60 hours"
  },
  {
    id: 10,
    title: "Cyberpunk 2077",
    thumbnail: "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1506&auto=format&fit=crop",
    genre: "RPG",
    platform: "PC",
    description: "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
    playtime: "75 hours"
  },
  {
    id: 11,
    title: "Stardew Valley",
    thumbnail: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1469&auto=format&fit=crop",
    genre: "Simulation",
    platform: "Mac",
    description: "An open-ended country-life RPG. You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools, you set out to begin your new life.",
    playtime: "110 hours"
  },
  {
    id: 12,
    title: "Disco Elysium",
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1470&auto=format&fit=crop",
    genre: "RPG",
    platform: "Mac",
    description: "A groundbreaking open world role playing game with unprecedented freedom of choice. Become a hero or an absolute disaster of a human being in this detective RPG.",
    playtime: "40 hours"
  }
];

type Filters = {
  genre: string;
  platform: string;
  status: string;
  search: string;
};

const LibraryContent = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [filters, setFilters] = useState<Filters>({
    genre: "All",
    platform: "All",
    status: "All",
    search: "",
  });
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Initialize games and favorites from local storage
  useEffect(() => {
    setGames(gamesData);
    const storedFavorites = localStorage.getItem("epicGamesFavorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

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

    // Apply status filter (Installed is just a mock filter as we don't track installation status)
    if (filters.status === "Favorites") {
      result = result.filter((game) => favorites.includes(game.id));
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((game) => 
        game.title.toLowerCase().includes(searchLower)
      );
    }

    setFilteredGames(result);
  }, [filters, games, favorites]);

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

  const handleViewDetails = (game: Game) => {
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

  // Get unique genre and platform values for filters
  const genres = ["All", ...new Set(games.map((game) => game.genre))];
  const platforms = ["All", ...new Set(games.map((game) => game.platform))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Library</h1>
      
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
            >
              <option value="All">All</option>
              <option value="Favorites">Favorites</option>
              <option value="Installed">Installed</option>
            </select>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="min-w-[250px]">
          <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            className="bg-[#202020] text-white text-sm rounded-lg block w-full p-2.5 border border-[#333333] focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search your library..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Game Count */}
      <p className="text-gray-400 mb-6">
        Showing {filteredGames.length} of {games.length} games
      </p>
      
      {/* Game Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div 
              key={game.id} 
              className="bg-[#202020] rounded-lg overflow-hidden border border-[#333333] hover:border-gray-600 transition-all"
            >
              <div className="relative h-[300px] w-full">
                <Image
                  src={game.thumbnail}
                  alt={game.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium text-lg truncate">{game.title}</h3>
                  <button
                    onClick={() => toggleFavorite(game.id)}
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                    aria-label={favorites.includes(game.id) ? "Remove from favorites" : "Add to favorites"}
                    tabIndex={0}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill={favorites.includes(game.id) ? "currentColor" : "none"} 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className={favorites.includes(game.id) ? "text-yellow-400" : ""}
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>{game.genre}</span>
                  <span>{game.platform}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInstall(game.title)}
                    className="flex-1 bg-[#0074e4] hover:bg-[#0066cc] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                    tabIndex={0}
                  >
                    Install
                  </button>
                  <button
                    onClick={() => handleViewDetails(game)}
                    className="flex-1 bg-[#333333] hover:bg-[#444444] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
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
                  >
                    Install
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryContent; 