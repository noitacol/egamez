import Image from 'next/image';
import Link from 'next/link';
import { EpicGame } from '../lib/epic-api';
import CountdownTimer from './CountdownTimer';

interface GameCardProps {
  game: EpicGame;
}

const GameCard = ({ game }: GameCardProps) => {
  const { title, namespace, keyImages, price, promotions } = game;
  
  // Oyun kapak resmini bul
  const coverImage = keyImages?.find(img => img.type === 'OfferImageWide' || img.type === 'DieselStoreFrontWide') || 
                     keyImages?.[0];
                     
  // Oyunun ücretsiz olduğu tarihleri hesapla
  const offers = promotions?.promotionalOffers?.[0]?.promotionalOffers;
  const upcomingOffers = promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers;
  
  const startDate = offers?.[0]?.startDate ? new Date(offers[0].startDate) : null;
  const endDate = offers?.[0]?.endDate ? new Date(offers[0].endDate) : null;
  
  const upcomingStartDate = upcomingOffers?.[0]?.startDate ? new Date(upcomingOffers[0].startDate) : null;
  
  // Oyun şu anda ücretsiz mi yoksa yakında mı ücretsiz olacak
  const isCurrentlyFree = !!offers && offers.length > 0;
  const isUpcoming = !!upcomingOffers && upcomingOffers.length > 0;
  
  return (
    <Link 
      href={`/game/${namespace}`}
      className="card group flex flex-col h-full transform hover:scale-102 transition-all duration-500 relative overflow-hidden" 
      tabIndex={0}
      aria-label={`${title} oyununu görüntüle`}
    >
      {/* Background pattern elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-epicblue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-epicaccent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative w-full h-56 overflow-hidden">
        {coverImage && (
          <Image 
            src={coverImage.url} 
            alt={title}
            fill
            className="object-cover transform group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Status badge (Ücretsiz/Yakında Ücretsiz) */}
        <div className="absolute top-3 left-3">
          {isCurrentlyFree ? (
            <div className="bg-epicgreen text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg">
              ÜCRETSIZ
            </div>
          ) : isUpcoming ? (
            <div className="bg-epicaccent text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg">
              YAKINDA ÜCRETSIZ
            </div>
          ) : null}
        </div>
        
        {/* Countdown timer */}
        {isCurrentlyFree && endDate && (
          <div className="absolute top-3 right-3">
            <CountdownTimer endDate={endDate} />
          </div>
        )}
        
        {isUpcoming && upcomingStartDate && (
          <div className="absolute top-3 right-3">
            <div className="bg-epicaccent/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-md shadow-md">
              {upcomingStartDate.toLocaleDateString('tr-TR')}'de
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow relative z-10">
        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-epicblue dark:group-hover:text-epicaccent transition-colors duration-300">{title}</h3>
        
        <div className="mt-auto">
          {price?.totalPrice && (
            <div className="flex items-center space-x-2 mt-2">
              {(isCurrentlyFree || isUpcoming) && price.totalPrice.originalPrice > 0 && (
                <div className="flex items-start">
                  <span className="line-through text-gray-500 dark:text-gray-400 text-sm mr-2">
                    {(price.totalPrice.originalPrice / 100).toFixed(2)} ₺
                  </span>
                  <span className="font-bold text-epicgreen dark:text-epicgreen">
                    {isCurrentlyFree ? 'ÜCRETSİZ' : 'YAKINDA ÜCRETSİZ'}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {startDate && endDate && isCurrentlyFree && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1 text-epicblue dark:text-epicaccent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {startDate.toLocaleDateString('tr-TR')} - {endDate.toLocaleDateString('tr-TR')}
            </div>
          )}
        </div>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-epicblue/5 dark:bg-epicaccent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </Link>
  );
};

export default GameCard; 