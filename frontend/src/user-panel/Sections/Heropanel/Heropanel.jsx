import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const originalSlides = [
  "/posters/poster1.jpg",
  "/posters/poster2.jpg"
];

const Heropanel = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at first real slide
  const [isTransitioning, setIsTransitioning] = useState(true);
  const slideRef = useRef(null);

  const extendedSlides = [
    originalSlides[originalSlides.length - 1],
    ...originalSlides,
    originalSlides[0]
  ];

  const totalSlides = extendedSlides.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(true);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => prev - 1);
    setIsTransitioning(true);
  };

  const goToSlide = (realIndex) => {
    setCurrentIndex(realIndex + 1); // Offset because of cloned first slide
    setIsTransitioning(true);
  };

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, []);

  // Reset to real first/last when reaching clones
  useEffect(() => {
    const handleTransitionEnd = () => {
      if (currentIndex === totalSlides - 1) {
        // If reached clone of first, reset to real first
        setIsTransitioning(false);
        setCurrentIndex(1);
      } else if (currentIndex === 0) {
        // If reached clone of last, reset to real last
        setIsTransitioning(false);
        setCurrentIndex(originalSlides.length);
      }
    };

    const slider = slideRef.current;
    if (slider) {
      slider.addEventListener("transitionend", handleTransitionEnd);
    }

    return () => {
      if (slider) {
        slider.removeEventListener("transitionend", handleTransitionEnd);
      }
    };
  }, [currentIndex]);

  return (
    <div className="heropanel w-screen text-black py-8  gap-4 flex flex-col items-center justify-center">
        {/* <div className="updates mt-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Latest Updates</h2>
        <p className="text-lg">Check out our latest products and offers!</p>
        </div> */}
        <div className="flex flex-col w-full py-10 gap-4 items-center bg-white justify-center">
      <div className="relative w-full max-w-7xl h-[400px] overflow-hidden rounded shadow">
        <div
          ref={slideRef}
          className={`flex ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
         
          }}
        >
          {extendedSlides.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slide ${index}`}
              className=" object-cover flex-shrink-0"
              style={{width: "100%" }}
            />
          ))}
        </div>

       
      </div>
       {/* Dots */}
        <div className=" w-full flex justify-center gap-2">
          {originalSlides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                currentIndex === index + 1 ? "bg-gray-400" : "bg-gray-200"
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
      <div className="companylogos   w-full max-w-7xl mt-8 flex justify-center">
        <ul className="flex gap-4">
            <li>    
                <img src="https://via.placeholder.com/100" alt="Logo 1" />
            </li>
            <li>
                <img src="https://via.placeholder.com/100" alt="Logo 2" />
                </li>
            <li>
                <img src="https://via.placeholder.com/100" alt="Logo 3"
                />
            </li>
        </ul>   
    </div>
    </div>
  );
};

export default Heropanel;
