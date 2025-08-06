import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, Users, Award, TrendingUp } from "lucide-react";

export default function ReviewSection() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Verified Customer",
      location: "New York, USA",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "Absolutely incredible experience! The product quality exceeded my expectations and the customer service was outstanding. I've been a loyal customer for over 2 years now.",
      product: "Wireless Headphones",
      verified: true,
      purchaseDate: "2 weeks ago"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Tech Enthusiast",
      location: "San Francisco, USA",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "As someone who's tried countless online stores, this one stands out for its reliability and product authenticity. Fast shipping and premium packaging every time!",
      product: "Smart Watch",
      verified: true,
      purchaseDate: "1 month ago"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Fashion Blogger",
      location: "Los Angeles, USA",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "The variety and quality of products here is unmatched. I've recommended this store to all my followers and they love it too. Definitely my go-to shopping destination!",
      product: "Designer Handbag",
      verified: true,
      purchaseDate: "3 days ago"
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Business Owner",
      location: "Chicago, USA",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "Professional service from start to finish. The team went above and beyond to ensure I got exactly what I needed for my business. Highly recommended!",
      product: "Office Equipment",
      verified: true,
      purchaseDate: "1 week ago"
    }
  ];

  const stats = [
    { icon: Users, label: "Happy Customers", value: "50K+", color: "from-blue-500 to-cyan-500" },
    { icon: Star, label: "Average Rating", value: "4.9/5", color: "from-yellow-400 to-orange-500" },
    { icon: Award, label: "Awards Won", value: "15+", color: "from-purple-500 to-pink-500" },
    { icon: TrendingUp, label: "Growth Rate", value: "200%", color: "from-green-500 to-emerald-500" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextTestimonial, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            What Our 
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"> Customers </span>
            Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. Here's what thousands of satisfied customers have to say about their experience with us.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Main Testimonial Card */}
        <div className="relative">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 mb-8 max-w-4xl mx-auto border border-gray-100">
            {/* Quote Icon */}
            <div className="absolute -top-6 left-8">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Quote className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 pt-6">
              {/* Profile Section */}
              <div className="flex-shrink-0 text-center lg:text-left">
                <div className="relative">
                  <img
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    className="w-32 h-32 rounded-2xl object-cover shadow-lg mx-auto lg:mx-0"
                  />
                  {currentTestimonial.verified && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 text-center lg:text-left">
                {/* Rating */}
                <div className="flex justify-center lg:justify-start mb-4">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6 font-medium">
                  "{currentTestimonial.text}"
                </blockquote>

                {/* Customer Info */}
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold text-gray-900">
                    {currentTestimonial.name}
                  </h4>
                  <p className="text-gray-600 text-lg">
                    {currentTestimonial.role} • {currentTestimonial.location}
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                    <span>Purchased: {currentTestimonial.product}</span>
                    <span>•</span>
                    <span>{currentTestimonial.purchaseDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={prevTestimonial}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            {/* Dots indicator */}
            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Auto-play toggle */}
          <div className="text-center mt-6">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
            </button>
          </div>
        </div>

        {/* Mini testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className={`p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                index === currentIndex 
                  ? 'bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200' 
                  : 'bg-white/50 hover:bg-white/80 border border-gray-200'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h5 className="font-semibold text-gray-900">{testimonial.name}</h5>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of satisfied customers today!
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300">
            Start Shopping Now
          </button>
        </div>
      </div>
    </div>
  );
}