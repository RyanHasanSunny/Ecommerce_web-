import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function ReviewSection() {
  const testimonials = [
    {
      id: 1,
      name: "James K.",
      role: "Traveler",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "You won't regret it. I would like to personally thank you for your outstanding product. Absolutely wonderful!"
    },
    {
      id: 2,
      name: "Sarah M.",
      role: "Designer",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "This company is amazing for those looking for honest and most of all those that look for quality. I'll definitely recommend it to my friends."
    },
    {
      id: 3,
      name: "John W.",
      role: "Business Owner",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "The customer service is exceptional and the quality exceeded my expectations. Will definitely order again!"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className=" py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          This Is What Our Customers Say
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scelerisque duis
        </p>

        {/* Testimonial Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={currentTestimonial.image}
                alt={currentTestimonial.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              {/* Quote */}
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                "{currentTestimonial.text}"
              </p>

              {/* Rating */}
              <div className="flex justify-center md:justify-start mb-4">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Name and Role */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-1">
                  {currentTestimonial.name}
                </h4>
                <p className="text-gray-600">
                  {currentTestimonial.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={prevTestimonial}
            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Dots indicator */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-gray-800' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextTestimonial}
            className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}