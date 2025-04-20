import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import GameCard from './GameCard';
import { ExtendedEpicGame } from '@/lib/types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SliderSectionProps {
  title: string;
  epicGames: ExtendedEpicGame[];
  gamerPowerGames: ExtendedEpicGame[];
  showSource?: boolean;
  autoplay?: boolean;
  slidesPerView?: number;
  type?: 'game' | 'loot' | 'beta';
}

const SliderSection: React.FC<SliderSectionProps> = ({
  title,
  epicGames = [],
  gamerPowerGames = [],
  showSource = true,
  autoplay = false,
  slidesPerView = 4,
  type = 'game',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'epic' | 'gamerpower'>('all');
  const sliderRef = useRef<any>(null);
  const [games, setGames] = useState<ExtendedEpicGame[]>([]);

  // Görüntülenecek oyunları filtreleyerek ayarla
  useEffect(() => {
    let filteredGames: ExtendedEpicGame[] = [];
    
    // Filtrelemeyi ve birleştirmeyi yap
    if (activeFilter === 'all') {
      filteredGames = [...epicGames, ...gamerPowerGames];
    } else if (activeFilter === 'epic') {
      filteredGames = epicGames;
    } else if (activeFilter === 'gamerpower') {
      filteredGames = gamerPowerGames;
    }
    
    // Önce oyunları karıştır sonra göster
    const shuffledGames = [...filteredGames].sort(() => Math.random() - 0.5);
    setGames(shuffledGames);
  }, [epicGames, gamerPowerGames, activeFilter]);

  const handlePrev = () => {
    if (sliderRef.current) {
      sliderRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      sliderRef.current.swiper.slideNext();
    }
  };

  // Platformlara göre oyun sayısını al
  const getGameCount = (platform: 'all' | 'epic' | 'gamerpower') => {
    if (platform === 'all') return epicGames.length + gamerPowerGames.length;
    if (platform === 'epic') return epicGames.length;
    if (platform === 'gamerpower') return gamerPowerGames.length;
    return 0;
  };

  return (
    <div className="w-full py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">{title}</h2>
        
        {showSource && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                activeFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Tümü
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-700 text-xs font-medium text-primary">
                {getGameCount('all')}
              </span>
            </button>
            
            <button
              onClick={() => setActiveFilter('epic')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                activeFilter === 'epic'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Epic
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-700 text-xs font-medium text-primary">
                {getGameCount('epic')}
              </span>
            </button>
            
            <button
              onClick={() => setActiveFilter('gamerpower')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                activeFilter === 'gamerpower'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              GamerPower
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-700 text-xs font-medium text-primary">
                {getGameCount('gamerpower')}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="relative group">
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FaChevronLeft className="w-5 h-5" />
        </button>
        
        <Swiper
          ref={sliderRef}
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={slidesPerView}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: slidesPerView },
          }}
          autoplay={autoplay ? { delay: 5000, disableOnInteraction: false } : false}
          loop={games.length > slidesPerView}
          className="w-full"
        >
          {games.map((game) => (
            <SwiperSlide key={`${game.source}-${game.id}`}>
              <GameCard 
                game={game} 
                isFree={type === 'game'}
                isLoot={type === 'loot'} 
                isBeta={type === 'beta'}
                showPlatform={showSource}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FaChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SliderSection; 