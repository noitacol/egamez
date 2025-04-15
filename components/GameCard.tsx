import Image from 'next/image';
import Link from 'next/link';
import { EpicGame } from '../lib/epic-api';

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
  const startDate = offers?.[0]?.startDate ? new Date(offers[0].startDate) : null;
  const endDate = offers?.[0]?.endDate ? new Date(offers[0].endDate) : null;
  
  // Kalan günleri hesapla
  const getRemainingDays = () => {
    if (!endDate) return null;
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  const remainingDays = getRemainingDays();
  
  return (
    <Link 
      href={`/game/${namespace}`}
      className="card group flex flex-col h-full hover:scale-105 transition-all duration-300" 
      tabIndex={0}
      aria-label={`${title} oyununu görüntüle`}
    >
      <div className="relative w-full h-52 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {remainingDays !== null && remainingDays <= 3 && (
          <div className="absolute top-3 right-3 bg-epicorange text-white text-xs font-bold px-2 py-1 rounded-md animate-pulse-slow">
            {remainingDays === 0 ? 'Son Gün!' : `${remainingDays} Gün Kaldı!`}
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow relative">
        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-epicblue dark:group-hover:text-epicaccent transition-colors duration-300">{title}</h3>
        
        <div className="mt-auto">
          {price?.totalPrice?.discountPrice === 0 ? (
            <div className="flex items-center space-x-2 mt-2">
              <span className="bg-epicgreen text-white text-sm font-bold px-2 py-1 rounded-md">Ücretsiz</span>
              {price?.totalPrice?.originalPrice > 0 && (
                <span className="line-through text-gray-500 dark:text-gray-400 text-sm">
                  {(price.totalPrice.originalPrice / 100).toFixed(2)} ₺
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 mt-2">
              <span className="bg-epicgreen text-white text-sm font-bold px-2 py-1 rounded-md">Ücretsiz</span>
              <span className="line-through text-gray-500 dark:text-gray-400 text-sm">
                {price?.totalPrice?.originalPrice ? `${(price.totalPrice.originalPrice / 100).toFixed(2)} ₺` : ''}
              </span>
            </div>
          )}
          
          {startDate && endDate && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1 text-epicblue dark:text-epicaccent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {startDate.toLocaleDateString('tr-TR')} - {endDate.toLocaleDateString('tr-TR')}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GameCard; 