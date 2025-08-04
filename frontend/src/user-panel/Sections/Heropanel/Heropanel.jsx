import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const originalSlides = [
  "/posters/poster1.jpg",
  "/posters/poster2.jpg"
];

const Heropanel = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
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
    setCurrentIndex(realIndex + 1);
    setIsTransitioning(true);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleTransitionEnd = () => {
      if (currentIndex === totalSlides - 1) {
        setIsTransitioning(false);
        setCurrentIndex(1);
      } else if (currentIndex === 0) {
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
    <div className="heropanel w-full text-black py-8 gap-4 flex flex-col items-center justify-center">
      <div className="w-full py-10 gap-4 flex flex-col items-center">
        <div className="relative w-full max-w-7xl h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded shadow">
          <div
            ref={slideRef}
            className={`flex ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {extendedSlides.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Slide ${index}`}
                className="w-full h-full object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="w-full flex justify-center gap-2 mt-4">
          {originalSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                currentIndex === index + 1 ? "bg-gray-500" : "bg-gray-300"
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Logos section */}
      <div className="companylogos w-full max-w-7xl py-10 flex justify-center">
        <ul className="flex flex-wrap justify-center gap-6 px-4">
          {[1, 2, 3].map((num) => (
            <li key={num}>
              <img
                src={`https://via.placeholder.com/100?text=Logo+${num}`}
                alt={`Logo ${num}`}
                className="w-[80px] h-auto sm:w-[100px]"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Heropanel;
