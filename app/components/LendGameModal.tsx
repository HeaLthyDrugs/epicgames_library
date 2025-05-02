"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { GameDisplay } from "../types/game";

type LendGameModalProps = {
  game: GameDisplay;
  isOpen: boolean;
  onClose: () => void;
  onLend: (gameId: number, friendName: string, email: string, duration: number) => void;
};

const LendGameModal = ({ game, isOpen, onClose, onLend }: LendGameModalProps) => {
  const [friendName, setFriendName] = useState("");
  const [email, setEmail] = useState("");
  const [duration, setDuration] = useState(7); // Default 7 days
  const [isValid, setIsValid] = useState(false);

  // Validate form whenever inputs change
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(
      friendName.trim().length > 0 && 
      emailRegex.test(email) && 
      duration > 0 && 
      duration <= 30
    );
  }, [friendName, email, duration]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFriendName("");
      setEmail("");
      setDuration(7);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onLend(game.id, friendName, email, duration);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[#202020] rounded-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Lend Game to a Friend</h2>
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
          
          <div className="flex items-center mb-6">
            <div className="relative w-16 h-16 mr-3 flex-shrink-0">
              <Image
                src={game.thumbnail}
                alt={game.title}
                fill
                className="object-cover rounded"
              />
            </div>
            <div>
              <h3 className="text-white text-lg font-medium">{game.title}</h3>
              <div className="text-sm text-gray-400">
                {game.genre} • {game.platform}
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="friend-name" className="block text-sm font-medium text-gray-300 mb-1">
                Friend's Name
              </label>
              <input
                type="text"
                id="friend-name"
                className="bg-[#333333] text-white text-sm rounded-lg block w-full p-2.5 border border-[#444444] focus:ring-blue-500 focus:border-blue-500"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="Enter your friend's name"
                required
                tabIndex={0}
              />
            </div>
            
            <div>
              <label htmlFor="friend-email" className="block text-sm font-medium text-gray-300 mb-1">
                Friend's Email
              </label>
              <input
                type="email"
                id="friend-email"
                className="bg-[#333333] text-white text-sm rounded-lg block w-full p-2.5 border border-[#444444] focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your friend's email"
                required
                tabIndex={0}
              />
            </div>
            
            <div>
              <label htmlFor="lend-duration" className="block text-sm font-medium text-gray-300 mb-1">
                Lending Duration (Days)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  id="lend-duration"
                  min="1"
                  max="30"
                  step="1"
                  className="w-full h-2 bg-[#555555] rounded-lg appearance-none cursor-pointer"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  tabIndex={0}
                />
                <span className="text-white font-medium min-w-[30px] text-center">{duration}</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="text-gray-400 text-sm">
                Your friend will be able to play this game for {duration} days.
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#333333] hover:bg-[#444444] text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                  tabIndex={0}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0074e4] hover:bg-[#0066cc] text-white py-2 px-4 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  tabIndex={0}
                  disabled={!isValid}
                >
                  Lend Game
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LendGameModal; 