import React, { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { GraduationCap, BookOpen, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

export function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (emblaApi) {
      const intervalId = setInterval(() => {
        emblaApi.scrollNext();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const slides = [
    {
      title: "Transform Your Future with Online Learning",
      description: "Access world-class education from anywhere in the world",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      icon: GraduationCap,
      cta: "Explore Courses",
      theme: "bg-indigo-600"
    },
    {
      title: "Join Our Learning Community",
      description: "Connect with experts and learners worldwide",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      icon: BookOpen,
      cta: "Sign Up Now",
      theme: "bg-purple-600"
    },
    {
      title: "New Year Special Offer",
      description: "Get 50% off on all courses - Limited time offer",
      image: "https://images.unsplash.com/photo-1513258496099-48168024aec0",
      icon: Tag,
      cta: "View Deals",
      theme: "bg-blue-600"
    }
  ];

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            return (
              <div 
                key={index}
                className="relative flex-[0_0_100%] min-w-0"
              >
                <div className={`${slide.theme} relative overflow-hidden`}>
                  <img 
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
                  />
                  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center text-white">
                      <Icon className="h-16 w-16 mx-auto mb-6" />
                      <h2 className="text-4xl md:text-5xl font-bold mb-6">{slide.title}</h2>
                      <p className="text-xl md:text-2xl mb-8 text-gray-100">{slide.description}</p>
                      <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        {slide.cta}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Navigation Arrows */}
      <button 
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-6 w-6 text-gray-800" />
      </button>
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
        onClick={scrollNext}
      >
        <ChevronRight className="h-6 w-6 text-gray-800" />
      </button>
    </div>
  );
}