"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type CarouselItem = {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isFree?: boolean;
};

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: "Wuthering Waves",
    subtitle: "NEW UPDATE",
    description: "Version 2.3 \"Fiery Arpeggio of Summer Reunion\" is coming! Meet the new 5-Star Resonator: \"Zani\" and \"Ciaccona\"!",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1470&auto=format&fit=crop",
    buttonText: "Play For Free",
    buttonLink: "/game/wuthering-waves",
    isFree: true
  },
  {
    id: 2,
    title: "May the 4th Be With You",
    description: "Celebrate Star Wars Day with epic deals on Star Wars games",
    image: "https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=1374&auto=format&fit=crop",
    buttonText: "Shop Now",
    buttonLink: "/collection/starwars"
  },
  {
    id: 3,
    title: "Honkai Star Rail",
    description: "Embark on an interstellar adventure in this space fantasy RPG",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1470&auto=format&fit=crop",
    buttonText: "Play Now",
    buttonLink: "/game/honkai-star-rail"
  },
  {
    id: 4,
    title: "Clair Obscur: Expedition 33",
    description: "Discover the mysteries of Expedition 33 in this immersive adventure",
    image: "https://images.unsplash.com/photo-1559762705-2123e682a8dc?q=80&w=1470&auto=format&fit=crop",
    buttonText: "Play Now",
    buttonLink: "/game/expedition-33"
  },
  {
    id: 5,
    title: "Infinity Nikki",
    subtitle: "NEW LIMITED OUTFITS AVAILABLE",
    description: "Infinity Nikki Version 1.5 \"Bubble Season\" is available now! 100 Pulls and 5 Free outfits can be obtained!",
    image: "https://images.unsplash.com/photo-1559583109-3e7968736000?q=80&w=1374&auto=format&fit=crop",
    buttonText: "Play For Free",
    buttonLink: "/game/infinity-nikki",
    isFree: true
  },
  {
    id: 6,
    title: "MotoGP™25",
    description: "Experience the thrill of MotoGP racing with the official game",
    image: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?q=80&w=1470&auto=format&fit=crop",
    buttonText: "Buy Now",
    buttonLink: "/game/motogp-25"
  }
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const ANIMATION_DURATION = 10000; // 10 seconds
  const UPDATE_INTERVAL = 100; // Update progress every 100ms for smooth animation

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  }, []);

  const startProgressTimer = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    setProgress(0);
    
    const stepSize = (UPDATE_INTERVAL / ANIMATION_DURATION) * 100;
    
    progressInterval.current = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + stepSize;
        
        if (newProgress >= 100) {
          handleNext();
          return 0;
        }
        
        return newProgress;
      });
    }, UPDATE_INTERVAL);
  }, [UPDATE_INTERVAL, ANIMATION_DURATION, handleNext]);

  useEffect(() => {
    startProgressTimer();
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentSlide, startProgressTimer]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleTileClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative bg-[#121212] h-[600px] flex overflow-hidden px-34">
      {/* Main carousel section (left side) */}
      <div className="flex-1 p-6">
        <div className="relative h-full w-full rounded-2xl overflow-hidden">
          {/* Current slide */}
          <div className="absolute inset-0 z-0">
            <Image 
              src={carouselItems[currentSlide].image} 
              alt={carouselItems[currentSlide].title}
              fill
              className="object-cover rounded-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10"></div>
          </div>
          
          {/* Game info */}
          <div className="absolute z-20 flex flex-col justify-end h-full w-full px-6 lg:px-8 pb-16">
            <div className="max-w-[600px]">
              {/* NEW UPDATE tag */}
              {carouselItems[currentSlide].subtitle && (
                <p className="text-[14px] uppercase tracking-wider font-medium text-white mb-2">{carouselItems[currentSlide].subtitle}</p>
              )}
              
              {/* Title */}
              <h2 className="text-4xl font-bold text-white mb-2">{carouselItems[currentSlide].title}</h2>
              
              {/* Description */}
              <p className="text-base text-white mb-6 max-w-md font-light">{carouselItems[currentSlide].description}</p>
              
              {/* Buttons */}
              <div className="flex items-center space-x-4">
                {carouselItems[currentSlide].isFree && (
                  <span className="text-white font-normal">Free</span>
                )}
                <Link 
                  href={carouselItems[currentSlide].buttonLink} 
                  className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded text-[14px] font-medium"
                  tabIndex={0}
                  aria-label={carouselItems[currentSlide].buttonText}
                >
                  {carouselItems[currentSlide].buttonText}
                </Link>
                <button 
                  className="bg-transparent border border-white text-white hover:bg-white/10 px-4 py-3 rounded flex items-center"
                  tabIndex={0}
                  aria-label="Add to Wishlist"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span className="ml-2 text-[14px]">Add to Wishlist</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 p-2 rounded-full hover:bg-black/70"
            onClick={handlePrev}
            tabIndex={0}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 p-2 rounded-full hover:bg-black/70"
            onClick={handleNext}
            tabIndex={0}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Game list sidebar (right side) */}
      <div className="w-[300px] z-20">
        <div className="h-full flex flex-col justify-start py-6">
          <div className="space-y-4 px-4">
            {carouselItems.map((item, index) => (
              <div 
                key={item.id} 
                className={`relative flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSlide === index ? "bg-[#333333]" : "bg-[#202020]/70 hover:bg-[#252525]"
                }`}
                onClick={() => handleTileClick(index)}
                tabIndex={0}
                role="button"
                aria-label={`View ${item.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleTileClick(index);
                  }
                }}
              >
                <div className="w-12 h-12 mr-3 relative overflow-hidden rounded">
                  <Image 
                    src={item.image}
                    alt={item.title}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <span className="text-white text-sm">{item.title}</span>
                
                {/* Progress indicator */}
                {currentSlide === index && (
                  <div className="absolute bottom-0 left-0 h-1 bg-[#444] w-full">
                    <div 
                      className="h-full bg-white transition-all duration-100 ease-linear" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carousel; 