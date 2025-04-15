import React, { ReactNode } from 'react';
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
          slidesPerView={1.2}
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
              slidesPerView: 2.2,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 3.2,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 4.2,
              spaceBetween: 16,
            },
            1280: {
              slidesPerView: 5.2,
              spaceBetween: 16,
            },
          }}
          className="game-slider"
        >
          {games.map((game) => (
            <SwiperSlide key={game.id}>
              <GameCard 
                game={game} 
                isFree={isFree} 
                isUpcoming={isUpcoming} 
                isTrending={isTrending} 
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        <div className="swiper-pagination mt-4"></div>
        
        <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-4 hover:bg-white dark:hover:bg-gray-800">
          <FiChevronLeft className="text-gray-800 dark:text-gray-200" />
        </button>
        
        <button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 hover:bg-white dark:hover:bg-gray-800">
          <FiChevronRight className="text-gray-800 dark:text-gray-200" />
        </button>
      </div>
    </div>
  );
};

export default GameSlider; 