import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { GraduationCap, BookOpen, Tag } from "lucide-react";
import AuthModal from "./AuthModal";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      theme: "bg-indigo-600",
    },
    {
      title: "Join Our Learning Community",
      description: "Connect with experts and learners worldwide",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      icon: BookOpen,
      cta: "Sign Up Now",
      theme: "bg-purple-600",
    },
    {
      title: "New Year Special Offer",
      description: "Get 50% off on all courses - Limited time offer",
      image: "https://images.unsplash.com/photo-1513258496099-48168024aec0",
      icon: Tag,
      cta: "View Deals",
      theme: "bg-blue-600",
    },
  ];

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const navigate = useNavigate();
  const handleSignUp = () => {
    navigate("/register");
    setIsModalOpen(false);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`relative flex-[0_0_100%] min-w-0 ${slide.theme}`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
              />
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center text-white">
                  <slide.icon className="h-16 w-16 mx-auto mb-6" />
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    {slide.title}
                  </h2>
                  <p className="text-xl md:text-2xl mb-8 text-gray-100">
                    {slide.description}
                  </p>
                  <button
                    onClick={
                      slide.cta === "Sign Up Now"
                        ? handleSignUp
                        : handleButtonClick
                    }
                    className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-900 p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
      >
        &lt;
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-900 p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
      >
        &gt;
      </button>

      {/* Auth Modal */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
