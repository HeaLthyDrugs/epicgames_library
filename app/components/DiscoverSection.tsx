"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type Game = {
  id: number;
  title: string;
  image: string;
  category: string;
  price: string;
  specialLabel?: string;
};

const games: Game[] = [
  {
    id: 1,
    title: "Clair Obscur: Expedition 33",
    image: "/game-images/expedition33.jpg",
    category: "Base Game",
    price: "₹2,999"
  },
  {
    id: 2,
    title: "Escape from Tarkov: Arena",
    image: "/game-images/tarkov-arena.jpg",
    category: "Base Game",
    price: "₹699",
    specialLabel: "First Beta"
  },
  {
    id: 3,
    title: "Promise Mascot Agency",
    image: "/game-images/promise-mascot.jpg",
    category: "Base Game",
    price: "₹789"
  },
  {
    id: 4,
    title: "REPOSE",
    image: "/game-images/repose.jpg",
    category: "Base Game",
    price: "Free"
  },
  {
    id: 5,
    title: "Mandragora: Whispers of the Witch Tree",
    image: "/game-images/mandragora.jpg",
    category: "Base Game",
    price: "₹899"
  },
  {
    id: 6,
    title: "33 Immortals",
    image: "/game-images/33-immortals.jpg",
    category: "Base Game",
    price: "₹719"
  }
];

const DiscoverSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

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
          {games.map((game) => (
            <div 
              key={game.id} 
              className="flex-shrink-0 w-80 group"
            >
              <div className="relative h-44 w-full overflow-hidden rounded-t-lg">
                <Image
                  src={game.image}
                  alt={game.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {game.specialLabel && (
                  <div className="absolute top-2 left-2 bg-blue-600 px-2 py-1 text-xs font-medium text-white rounded">
                    {game.specialLabel}
                  </div>
                )}
              </div>
              <div className="bg-[#121212] p-4 rounded-b-lg">
                <span className="text-xs text-gray-400 block mb-1">{game.category}</span>
                <h3 className="text-base font-medium text-white mb-2 truncate">{game.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{game.price}</span>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                    tabIndex={0}
                    aria-label={`Add ${game.title} to wishlist`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscoverSection; 