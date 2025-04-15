import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EpicGame } from '@/lib/epic-api';

interface GameCardProps {
  game: EpicGame;
  isFree?: boolean;
  isUpcoming?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, isFree = false, isUpcoming = false }) => {
  const [imageError, setImageError] = useState(false);

  // Tarih kontrolü
  const currentDate = new Date();
  const endDate = game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0]?.endDate
    ? new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate)
    : null;
  
  // Kalan günleri hesapla
  const remainingDays = endDate
    ? Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Ücretsiz oyun mu kontrolü
  const isFreeGame = game.price?.totalPrice?.discountPrice === 0;

  return (
    <Link href={`https://store.epicgames.com/en-US/p/${game.urlSlug || game.productSlug}`} target="_blank">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gray-700 h-full flex flex-col">
        <div className="relative h-48 w-full">
          {!imageError ? (
            <Image
              src={game.keyImages?.[0]?.url || "/placeholder.png"}
              alt={game.title || "Game Title"}
              fill
              style={{ objectFit: "cover" }}
              onError={() => setImageError(true)}
              className="transition-transform duration-300 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
              No Image Available
            </div>
          )}
          {isFreeGame && remainingDays !== null && (
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold p-2 m-2 rounded">
              {remainingDays === 0
                ? "Son Gün!"
                : remainingDays > 0
                ? `${remainingDays} Gün Kaldı`
                : "Süresi Doldu"}
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{game.title}</h3>
          
          <div className="mt-auto">
            {isFreeGame ? (
              <div className="flex items-center space-x-2">
                <span className="line-through text-gray-400">
                  {game.price?.totalPrice?.originalPrice
                    ? `₺${(game.price.totalPrice.originalPrice / 100).toFixed(2)}`
                    : ""}
                </span>
                <span className="bg-green-600 text-white px-2 py-1 rounded font-bold">ÜCRETSİZ</span>
              </div>
            ) : (
              <span className="text-white">
                {game.price?.totalPrice?.originalPrice
                  ? `₺${(game.price.totalPrice.originalPrice / 100).toFixed(2)}`
                  : "Fiyat Bilgisi Yok"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GameCard; 