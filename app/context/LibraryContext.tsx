"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Game } from "../services/rawg-api";
import { GameDisplay } from "../types/game";
import { SharedLibrary } from "../components/ShareLibraryModal";

type PurchasedGame = Game & {
  purchaseDate: string;
};

export type LentGame = {
  id: string;
  gameId: number;
  friendName: string;
  email: string;
  lendDate: string;
  expiryDate: string;
  duration: number;
};

interface LibraryContextType {
  purchasedGames: PurchasedGame[];
  addGameToLibrary: (game: Game) => void;
  isGameInLibrary: (gameId: number) => boolean;
  sharedLibraries: SharedLibrary[];
  createSharedLibrary: (library: SharedLibrary) => void;
  getSharedLibraryById: (id: string) => SharedLibrary | undefined;
  deleteSharedLibrary: (id: string) => void;
  lentGames: LentGame[];
  lendGame: (gameId: number, friendName: string, email: string, duration: number) => void;
  revokeLentGame: (lentGameId: string) => void;
  extendLentGame: (lentGameId: string, additionalDays: number) => void;
  isGameLent: (gameId: number) => boolean;
  convertToGameDisplay: (game: Game) => GameDisplay;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [purchasedGames, setPurchasedGames] = useState<PurchasedGame[]>([]);
  const [sharedLibraries, setSharedLibraries] = useState<SharedLibrary[]>([]);
  const [lentGames, setLentGames] = useState<LentGame[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      // Load purchased games
      const storedGames = localStorage.getItem("epicGamesPurchases");
      if (storedGames) {
        setPurchasedGames(JSON.parse(storedGames));
      }
      
      // Load shared libraries
      const storedLibraries = localStorage.getItem("epicGamesSharedLibraries");
      if (storedLibraries) {
        setSharedLibraries(JSON.parse(storedLibraries));
      }
      
      // Load lent games
      const storedLentGames = localStorage.getItem("epicGamesLentGames");
      if (storedLentGames) {
        setLentGames(JSON.parse(storedLentGames));
      }
    };
    
    loadData();
  }, []);

  // Helper function to convert Game to GameDisplay
  const convertToGameDisplay = (game: Game): GameDisplay => {
    return {
      id: game.id,
      title: game.name,
      thumbnail: game.background_image || "https://placehold.co/400x225/121212/cccccc?text=No+Image",
      genre: game.genres && game.genres.length > 0 ? game.genres[0].name : "Unknown",
      platform: game.platforms && game.platforms.length > 0 ? game.platforms[0].platform.name : "PC",
      description: game.description_raw || `Explore ${game.name}, a fantastic game with amazing gameplay experience.`,
      playtime: "0 hours"
    };
  };

  // Add a game to the library
  const addGameToLibrary = (game: Game) => {
    // Skip if game is already purchased
    if (isGameInLibrary(game.id)) return;
    
    const purchasedGame: PurchasedGame = {
      ...game,
      purchaseDate: new Date().toISOString(),
    };
    
    const updatedLibrary = [...purchasedGames, purchasedGame];
    setPurchasedGames(updatedLibrary);
    localStorage.setItem("epicGamesPurchases", JSON.stringify(updatedLibrary));
  };

  // Check if a game is in the library
  const isGameInLibrary = (gameId: number): boolean => {
    return purchasedGames.some(game => game.id === gameId);
  };

  // Create a shared library
  const createSharedLibrary = (library: SharedLibrary) => {
    const updatedLibraries = [...sharedLibraries, library];
    setSharedLibraries(updatedLibraries);
    localStorage.setItem("epicGamesSharedLibraries", JSON.stringify(updatedLibraries));
  };

  // Get a shared library by ID
  const getSharedLibraryById = (id: string): SharedLibrary | undefined => {
    return sharedLibraries.find(library => library.id === id);
  };

  // Delete a shared library
  const deleteSharedLibrary = (id: string) => {
    const updatedLibraries = sharedLibraries.filter(library => library.id !== id);
    setSharedLibraries(updatedLibraries);
    localStorage.setItem("epicGamesSharedLibraries", JSON.stringify(updatedLibraries));
  };

  // Lend a game to a friend
  const lendGame = (gameId: number, friendName: string, email: string, duration: number) => {
    // Get the game from purchased games
    const game = purchasedGames.find(g => g.id === gameId);
    if (!game) return;
    
    // Calculate expiry date
    const lendDate = new Date();
    const expiryDate = new Date(lendDate);
    expiryDate.setDate(expiryDate.getDate() + duration);
    
    const newLentGame: LentGame = {
      id: crypto.randomUUID(),
      gameId,
      friendName,
      email,
      lendDate: lendDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      duration
    };
    
    const updatedLentGames = [...lentGames, newLentGame];
    setLentGames(updatedLentGames);
    localStorage.setItem("epicGamesLentGames", JSON.stringify(updatedLentGames));
  };

  // Revoke a lent game
  const revokeLentGame = (lentGameId: string) => {
    const updatedLentGames = lentGames.filter(game => game.id !== lentGameId);
    setLentGames(updatedLentGames);
    localStorage.setItem("epicGamesLentGames", JSON.stringify(updatedLentGames));
  };

  // Extend the lending period for a game
  const extendLentGame = (lentGameId: string, additionalDays: number) => {
    const updatedLentGames = lentGames.map(game => {
      if (game.id === lentGameId) {
        const currentExpiry = new Date(game.expiryDate);
        currentExpiry.setDate(currentExpiry.getDate() + additionalDays);
        
        return {
          ...game,
          expiryDate: currentExpiry.toISOString(),
          duration: game.duration + additionalDays
        };
      }
      return game;
    });
    
    setLentGames(updatedLentGames);
    localStorage.setItem("epicGamesLentGames", JSON.stringify(updatedLentGames));
  };

  // Check if a game is currently lent
  const isGameLent = (gameId: number): boolean => {
    const now = new Date();
    return lentGames.some(game => 
      game.gameId === gameId && 
      new Date(game.expiryDate) > now
    );
  };

  return (
    <LibraryContext.Provider 
      value={{ 
        purchasedGames, 
        addGameToLibrary, 
        isGameInLibrary,
        sharedLibraries,
        createSharedLibrary,
        getSharedLibraryById,
        deleteSharedLibrary,
        lentGames,
        lendGame,
        revokeLentGame,
        extendLentGame,
        isGameLent,
        convertToGameDisplay
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}; 