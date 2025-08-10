import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Star, Search, TrendingUp } from "lucide-react";
import apiService from "../../api/api";

const HeroPanel = ({ heroData }) => {
  // Default slides as fallback
  const defaultSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
      altText: "Fashion Collection"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
      altText: "Electronics"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop",
      altText: "Shopping"
    }
  ];

  // Text slides for continuous animation
  const textSlides = [
    "🎉 Summer Sale - Up to 50% OFF on all products!",
    "🚚 Free Shipping on orders above $50",
    
  ];
  // Use backend data if available, otherwise use default slides
  const originalSlides = heroData && heroData.length > 0 
    ? heroData.map((item, index) => ({
        id: index + 1,
        image: item.imageUrl,
        altText: item.altText || `Slide ${index + 1}`
      }))
    : defaultSlides;

  // Create infinite slides by duplicating first and last slides
  const slides = [
    originalSlides[originalSlides.length - 1], // Last slide at beginning
    ...originalSlides,
    originalSlides[0] // First slide at end
  ];

  const [currentIndex, setCurrentIndex] = useState(0); // Start at first real slide
  const [currentIndex1, setCurrentIndex1] = useState(1); // Start at first real slide
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      if (newIndex === slides.length - 1) {
        setTimeout(() => {
          setCurrentIndex(1);
        }, 500);
      }
      return newIndex;
    });
    
    setCurrentIndex1((prev) => {
      const newIndex = prev + 1;
      if (newIndex === slides.length - 1) {
        setTimeout(() => {
          setCurrentIndex1(1);
        }, 500);
      }
      return newIndex;
    });
    
    setTimeout(() => setIsTransitioning(false), 500);
  }, [slides.length, isTransitioning]);

  const goToSlide = (index) => {
    const realIndex = index + 1; // +1 because of duplicate at beginning
    if (isTransitioning || realIndex === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(realIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide1 = (index) => {
    const realIndex = index + 1; // +1 because of duplicate at beginning
    if (isTransitioning || realIndex === currentIndex1) return;
    setIsTransitioning(true);
    setCurrentIndex1(realIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isAutoPlaying]);

  // Get the real index for indicators (excluding duplicates)
  const getRealIndex = (index) => {
    if (index === 0) return originalSlides.length - 1;
    if (index === slides.length - 1) return 0;
    return index - 1;
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="flex flex-wrap justify-center h-full">
      {/* Hero Carousel */}
      <div className="relative  overflow-hidden"
      style={{ aspectRatio: "16 / 4" }}>
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
          }}
        >
          {slides.map((slide, slideIndex) => (
            <div key={`${slide.id}-${slideIndex}`} className="relative w-full h-full flex-shrink-0">
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.altText}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay Content */}
            
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {originalSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1 h-1 rounded-full transition-all duration-200 ${
                index === getRealIndex(currentIndex)
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
       {/* Sliding Text Banner */}
        <div className=" w-full bg-gray-200 py-2 overflow-hidden">
          <div className="relative">
            <div className="animate-slide-right-to-left whitespace-nowrap">
              {textSlides.map((text, index) => (
                <span key={index} className="inline-block px-8 text-black font-semibold text-sm m:text-lg ">
                  {text}
                </span>
              ))}
            
            </div>
          </div>
        </div>
      
      <style jsx>{`
        @keyframes slide-right-to-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-slide-right-to-left {
          animation: slide-right-to-left 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HeroPanel;
