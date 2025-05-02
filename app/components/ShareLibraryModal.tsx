"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { GameDisplay } from "../types/game";

type ShareLibraryModalProps = {
  games: GameDisplay[];
  isOpen: boolean;
  onClose: () => void;
  onShare: (sharedLibrary: SharedLibrary) => void;
};

export type SharedLibrary = {
  id: string;
  title: string;
  games: GameDisplay[];
  createdAt: string;
};

const ShareLibraryModal = ({ games, isOpen, onClose, onShare }: ShareLibraryModalProps) => {
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [title, setTitle] = useState("My Epic Games Collection");
  
  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedGames([]);
      setTitle("My Epic Games Collection");
    }
  }, [isOpen]);

  const handleToggleGame = (gameId: number) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGames.length === games.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(games.map(game => game.id));
    }
  };

  const handleShare = () => {
    if (selectedGames.length === 0) {
      alert("Please select at least one game to share");
      return;
    }

    const sharedLibrary: SharedLibrary = {
      id: crypto.randomUUID(),
      title: title.trim() || "My Epic Games Collection",
      games: games.filter(game => selectedGames.includes(game.id)),
      createdAt: new Date().toISOString()
    };

    onShare(sharedLibrary);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-[#202020] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Share Your Library</h2>
            <button 
              className="text-gray-400 hover:text-gray-300"
              onClick={onClose}
              aria-label="Close modal"
              tabIndex={0}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <label htmlFor="share-title" className="block text-sm font-medium text-gray-300 mb-2">
              Collection Title
            </label>
            <input
              type="text"
              id="share-title"
              className="bg-[#333333] text-white text-sm rounded-lg block w-full p-2.5 border border-[#444444] focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your collection a name"
              maxLength={50}
              tabIndex={0}
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-300 text-lg">Select Games to Share</h3>
              <button
                onClick={handleSelectAll}
                className="text-[#0074e4] hover:text-[#0066cc] text-sm"
                tabIndex={0}
              >
                {selectedGames.length === games.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            
            <div className="bg-[#181818] rounded-lg p-4 max-h-[40vh] overflow-y-auto">
              {games.length > 0 ? (
                <ul className="space-y-2">
                  {games.map((game) => (
                    <li key={game.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`game-${game.id}`}
                        className="w-4 h-4 text-blue-600 bg-[#333333] border-[#444444] rounded focus:ring-blue-500"
                        checked={selectedGames.includes(game.id)}
                        onChange={() => handleToggleGame(game.id)}
                        tabIndex={0}
                      />
                      <label 
                        htmlFor={`game-${game.id}`}
                        className="flex items-center ml-2 cursor-pointer w-full"
                      >
                        <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                          <Image
                            src={game.thumbnail}
                            alt={game.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <span className="text-white text-sm">{game.title}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-center py-4">Your library is empty. Purchase games to share them.</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-[#333333]">
            <div className="text-gray-400 text-sm">
              {selectedGames.length} of {games.length} games selected
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="bg-[#333333] hover:bg-[#444444] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                tabIndex={0}
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="bg-[#0074e4] hover:bg-[#0066cc] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                tabIndex={0}
                disabled={selectedGames.length === 0}
              >
                Create Shareable Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareLibraryModal; 