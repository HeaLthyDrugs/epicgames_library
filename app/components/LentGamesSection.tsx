"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { GameDisplay } from "../types/game";

type LentGame = {
  id: string;
  gameId: number;
  game: GameDisplay;
  friendName: string;
  email: string;
  lendDate: string;
  expiryDate: string;
  duration: number;
  isExpired: boolean;
};

type LentGamesSectionProps = {
  lentGames: LentGame[];
  onRevoke: (lentGameId: string) => void;
  onExtend: (lentGameId: string, additionalDays: number) => void;
};

const LentGamesSection = ({ lentGames, onRevoke, onExtend }: LentGamesSectionProps) => {
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [extensionDays, setExtensionDays] = useState<number>(7);

  if (lentGames.length === 0) {
    return null;
  }

  const toggleExpand = (lentGameId: string) => {
    setExpandedGameId(expandedGameId === lentGameId ? null : lentGameId);
    setExtensionDays(7); // Reset extension days when toggling
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleExtend = (lentGameId: string) => {
    onExtend(lentGameId, extensionDays);
    setExpandedGameId(null);
  };

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-xl font-bold text-white mb-4">Games You've Lent</h2>
      <div className="bg-[#202020] rounded-lg overflow-hidden">
        <ul className="divide-y divide-[#333333]">
          {lentGames.map((lentGame) => (
            <li key={lentGame.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="relative w-16 h-16 mr-3 flex-shrink-0">
                    <Image
                      src={lentGame.game.thumbnail}
                      alt={lentGame.game.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{lentGame.game.title}</h3>
                    <p className="text-sm text-gray-400">Lent to: {lentGame.friendName}</p>
                    {lentGame.isExpired ? (
                      <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-yellow-800 text-yellow-100">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-green-800 text-green-100">
                        {getDaysRemaining(lentGame.expiryDate)} days remaining
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex">
                  <button
                    onClick={() => toggleExpand(lentGame.id)}
                    className="bg-[#333333] hover:bg-[#444444] text-white py-1.5 px-3 rounded-l text-sm font-medium transition-colors"
                    tabIndex={0}
                  >
                    {expandedGameId === lentGame.id ? "Cancel" : "Manage"}
                  </button>
                  <button
                    onClick={() => onRevoke(lentGame.id)}
                    className="bg-[#d83232] hover:bg-[#b52b2b] text-white py-1.5 px-3 rounded-r text-sm font-medium transition-colors"
                    tabIndex={0}
                    aria-label="Revoke access"
                  >
                    Revoke
                  </button>
                </div>
              </div>

              {expandedGameId === lentGame.id && (
                <div className="mt-4 pt-4 border-t border-[#333333]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Lent on</p>
                      <p className="text-white">{formatDate(lentGame.lendDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Expiration</p>
                      <p className="text-white">{formatDate(lentGame.expiryDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Friend's Email</p>
                      <p className="text-white">{lentGame.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Duration</p>
                      <p className="text-white">{lentGame.duration} days</p>
                    </div>
                  </div>

                  {!lentGame.isExpired && (
                    <div className="mt-4">
                      <p className="text-sm text-white mb-2">Extend lending period:</p>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 flex items-center space-x-2">
                          <input
                            type="range"
                            min="1"
                            max="30"
                            step="1"
                            className="w-full h-2 bg-[#555555] rounded-lg appearance-none cursor-pointer"
                            value={extensionDays}
                            onChange={(e) => setExtensionDays(parseInt(e.target.value))}
                            tabIndex={0}
                          />
                          <span className="text-white font-medium min-w-[30px] text-center">{extensionDays}</span>
                        </div>
                        <button
                          onClick={() => handleExtend(lentGame.id)}
                          className="bg-[#0074e4] hover:bg-[#0066cc] text-white py-1.5 px-4 rounded text-sm font-medium"
                          tabIndex={0}
                        >
                          Extend
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LentGamesSection; 