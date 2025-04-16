import React, { ReactNode, useEffect, useState } from 'react';
import { ExtendedEpicGame } from './GameCard';
import GameCard from './GameCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface GameSliderProps {
  games: ExtendedEpicGame[];
  title: string;
  emptyMessage?: string;
  icon?: ReactNode;
  isFree?: boolean;
  isUpcoming?: boolean;
  isTrending?: boolean;
}

const GameSlider: React.FC<GameSliderProps> = ({
  games,
  title,
  emptyMessage = "Şu anda oyun bulunamadı.",
  icon,
  isFree = false,
  isUpcoming = false,
  isTrending = false,
}) => {
  const [slidesPerView, setSlidesPerView] = useState<{[key: string]: number}>({
    base: 1.2,
    sm: 2.2,
    md: 3.2,
    lg: 4.2,
    xl: 5.2
  });

  // Oyun sayısına göre slidesPerView değerlerini ayarla
  useEffect(() => {
    // Eğer oyun sayısı az ise, ekrandaki tüm alanı dolduracak şekilde ayarla
    if (games.length <= 3) {
      setSlidesPerView({
        base: Math.min(games.length, 1),
        sm: Math.min(games.length, 2),
        md: Math.min(games.length, 3),
        lg: Math.min(games.length, 3),
        xl: Math.min(games.length, 3)
      });
    } else if (games.length <= 5) {
      setSlidesPerView({
        base: 1,
        sm: 2,
        md: Math.min(games.length, 3),
        lg: Math.min(games.length, 4),
        xl: Math.min(games.length, 5)
      });
    }
    // games.length > 5 ise, varsayılan slidesPerView değerlerini kullan
  }, [games.length]);

  if (!games || games.length === 0) {
    return (
      <div className="my-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      {title && (
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          {icon && (
            <span className={`mr-2 p-2 rounded-lg text-white ${
              isTrending ? 'bg-gradient-to-r from-red-600 to-orange-600' : 
              isFree ? 'bg-gradient-to-r from-epicblue to-blue-600' :
              isUpcoming ? 'bg-gradient-to-r from-purple-600 to-purple-800' :
              'bg-gradient-to-r from-gray-700 to-gray-900'
            }`}>
              {icon}
            </span>
          )}
          <span className={`bg-clip-text text-transparent ${
            isTrending ? 'bg-gradient-to-r from-red-500 to-orange-500' : 
            isFree ? 'bg-gradient-to-r from-epicblue to-blue-600' :
            isUpcoming ? 'bg-gradient-to-r from-purple-600 to-purple-800' :
            'bg-gradient-to-r from-gray-700 to-gray-900'
          }`}>
            {title}
          </span>
        </h2>
      )}
      
      <div className="relative group">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={slidesPerView.base}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{ 
            clickable: true,
            el: '.swiper-pagination',
            type: 'bullets',
          }}
          breakpoints={{
            640: {
              slidesPerView: slidesPerView.sm,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: slidesPerView.md,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: slidesPerView.lg,
              spaceBetween: 16,
            },
            1280: {
              slidesPerView: slidesPerView.xl,
              spaceBetween: 16,
            },
          }}
          className="game-slider"
        >
          {games.map((game) => (
            <SwiperSlide key={game.id} className="h-auto">
              <div className={`h-full ${games.length <= 3 ? 'max-w-lg mx-auto' : ''}`}>
                <GameCard 
                  game={game} 
                  isFree={isFree} 
                  isUpcoming={isUpcoming} 
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        <div className="swiper-pagination mt-4"></div>
        
        {/* Eğer oyun sayısı 1'den fazla ise navigasyon butonlarını göster */}
        {games.length > 1 && (
          <>
            <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-4 hover:bg-white dark:hover:bg-gray-800">
              <FiChevronLeft className="text-gray-800 dark:text-gray-200" />
            </button>
            
            <button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 hover:bg-white dark:hover:bg-gray-800">
              <FiChevronRight className="text-gray-800 dark:text-gray-200" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GameSlider; 