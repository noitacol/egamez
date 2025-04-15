import React, { ReactNode, useState, useEffect } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface SliderProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
}

const Slider: React.FC<SliderProps> = ({ children, title, icon }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slides: {
      perView: 'auto',
      spacing: 16,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: {
          perView: 2,
          spacing: 16,
        },
      },
      '(min-width: 768px)': {
        slides: {
          perView: 3,
          spacing: 16,
        },
      },
      '(min-width: 1024px)': {
        slides: {
          perView: 4,
          spacing: 16,
        },
      },
      '(min-width: 1280px)': {
        slides: {
          perView: 5,
          spacing: 16,
        },
      },
    },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  const handlePrevSlide = () => {
    instanceRef.current?.prev();
  };

  const handleNextSlide = () => {
    instanceRef.current?.next();
  };

  return (
    <div className="relative mb-12">
      {title && (
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          {icon && (
            <span className="bg-gradient-to-r from-epicblue to-epicpurple p-1.5 mr-2 rounded text-white">
              {icon}
            </span>
          )}
          <span className="bg-gradient-to-r from-epicblue/80 to-epicpurple/80 bg-clip-text text-transparent">
            {title}
          </span>
        </h2>
      )}
      
      <div className="relative">
        <div ref={sliderRef} className="keen-slider overflow-visible">
          {children}
        </div>
        
        {loaded && instanceRef.current && (
          <>
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md text-gray-800 dark:text-white opacity-80 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed z-10 transform -translate-x-1/2"
              aria-label="Previous slide"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleNextSlide}
              disabled={
                currentSlide ===
                instanceRef.current.track.details.slides.length - 1
              }
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md text-gray-800 dark:text-white opacity-80 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed z-10 transform translate-x-1/2"
              aria-label="Next slide"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Slider; 