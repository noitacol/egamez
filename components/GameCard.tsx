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
  
  return (
    <Link 
      href={`/game/${namespace}`}
      className="card flex flex-col h-full hover:scale-105 transition-transform duration-200" 
      tabIndex={0}
      aria-label={`${title} oyununu görüntüle`}
    >
      <div className="relative w-full h-48">
        {coverImage && (
          <Image 
            src={coverImage.url} 
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{title}</h3>
        
        <div className="mt-auto">
          {price?.totalPrice?.discountPrice === 0 ? (
            <div className="text-green-600 dark:text-green-400 font-bold">Ücretsiz</div>
          ) : (
            <div>
              <span className="line-through text-gray-500 dark:text-gray-400 mr-2">
                {price?.totalPrice?.originalPrice ? `${price.totalPrice.originalPrice / 100} ₺` : ''}
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">Ücretsiz</span>
            </div>
          )}
          
          {startDate && endDate && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {startDate.toLocaleDateString('tr-TR')} - {endDate.toLocaleDateString('tr-TR')}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GameCard; 