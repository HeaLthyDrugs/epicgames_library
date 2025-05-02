"use client";

import Link from "next/link";
import Image from "next/image";

type Game = {
  id: number;
  title: string;
  image: string;
  status: "FREE NOW" | "COMING SOON";
  availability?: string;
};

const games: Game[] = [
  {
    id: 1,
    title: "Super Space Club",
    image: "/game-images/super-space-club.jpg",
    status: "FREE NOW",
    availability: "Free Now - May 08 at 08:30 PM"
  },
  {
    id: 2,
    title: "Deadtime Defenders",
    image: "/game-images/deadtime-defenders.jpg",
    status: "COMING SOON",
    availability: "Free May 08 - May 15"
  },
  {
    id: 3,
    title: "Touch Type Tale",
    image: "/game-images/touch-type-tale.jpg",
    status: "COMING SOON",
    availability: "Free May 08 - May 15"
  }
];

const FreeGames = () => {
  return (
    <section className="bg-[#121212] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-white mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 12a8 8 0 01-8 8v-2a6 6 0 006-6h2zm0-8a2 2 0 012 2v1.18c-.9-.14-1.8-.18-2.7-.18H20V4zM8.82 12c0 .34.03.67.08 1H4v2h3.18c.19.7.45 1.39.82 2H4v2h5.17c1.13 1.19 2.58 2 4.18 2H4a2 2 0 01-2-2v-8a2 2 0 012-2h10.17A7.919 7.919 0 008.82 12z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Free Games</h2>
          </div>
          <Link 
            href="/free-games" 
            className="text-white hover:text-gray-300 border border-white/30 px-4 py-2 rounded hover:bg-white/10"
            tabIndex={0}
            aria-label="View More Free Games"
          >
            View More
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="group">
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="relative h-48 md:h-64 w-full">
                  <Image
                    src={game.image}
                    alt={game.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className={`inline-block px-3 py-1 mb-2 text-xs font-medium ${
                    game.status === "FREE NOW" ? "bg-purple-600" : "bg-gray-700"
                  } text-white`}>
                    {game.status}
                  </span>
                </div>
              </div>
              <div className="bg-[#202020] p-4 rounded-b-lg">
                <h3 className="text-lg font-medium text-white mb-2">{game.title}</h3>
                <p className="text-sm text-gray-400">{game.availability}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreeGames; 