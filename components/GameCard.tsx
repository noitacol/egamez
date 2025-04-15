import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EpicGame } from '../lib/epic-api';

interface GameCardProps {
  game: EpicGame;
  isFree?: boolean;
  isUpcoming?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, isFree = false, isUpcoming = false }) => {
  const [imageError, setImageError] = useState(false);

  // Tarih kontrolü
  const currentDate = new Date();
  let startDate = null;
  let endDate = null;
  
  // Steam oyunu mu Epic oyunu mu kontrolü
  const isSteamGame = game.id?.startsWith('steam_');
  
  if (isUpcoming && !isSteamGame) {
    // Yakında ücretsiz olacak oyunlar için
    const upcomingOffers = game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers;
    startDate = upcomingOffers?.[0]?.startDate ? new Date(upcomingOffers[0].startDate) : null;
    endDate = upcomingOffers?.[0]?.endDate ? new Date(upcomingOffers[0].endDate) : null;
  } else if (!isSteamGame) {
    // Şu anda ücretsiz olan oyunlar için (Epic Games)
    const currentOffers = game.promotions?.promotionalOffers?.[0]?.promotionalOffers;
    startDate = currentOffers?.[0]?.startDate ? new Date(currentOffers[0].startDate) : null;
    endDate = currentOffers?.[0]?.endDate ? new Date(currentOffers[0].endDate) : null;
  } else if (isSteamGame && game.promotions) {
    // Steam oyunları için tarih (Steam oyunları için promotions manuel olarak ayarlanıyor)
    const steamOffers = game.promotions?.promotionalOffers?.[0]?.promotionalOffers;
    startDate = steamOffers?.[0]?.startDate ? new Date(steamOffers[0].startDate) : null;
    endDate = steamOffers?.[0]?.endDate ? new Date(steamOffers[0].endDate) : null;
  }
  
  // Kalan günleri hesapla
  const remainingDays = endDate
    ? Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
    
  // Başlamasına kalan günleri hesapla (yakında gelecek oyunlar için)
  const daysUntilStart = startDate && isUpcoming
    ? Math.ceil((startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Ücretsiz oyun mu kontrolü
  const isFreeGame = isFree || game.price?.totalPrice?.discountPrice === 0;

  // Oyunun mağaza URL'ini belirle
  const storeUrl = isSteamGame 
    ? game.productSlug || `https://store.steampowered.com/app/${game.id.replace('steam_', '')}`
    : `https://store.epicgames.com/tr/p/${game.urlSlug || game.productSlug}`;

  return (
    <Link href={storeUrl} target="_blank">
      <div className={`rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 h-full flex flex-col ${isUpcoming ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
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
          
          {/* Platform etiketi */}
          <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white text-xs font-bold p-1 m-2 rounded">
            {isSteamGame ? 'STEAM' : 'EPIC'}
          </div>
          
          {/* Durum etiketi */}
          {isUpcoming ? (
            <div className="absolute top-0 right-0 bg-epicaccent text-white text-xs font-bold p-2 m-2 rounded">
              {daysUntilStart === null
                ? "Yakında"
                : daysUntilStart === 0
                ? "Bugün Başlıyor!"
                : daysUntilStart > 0
                ? `${daysUntilStart} Gün Sonra`
                : "Yakında"}
            </div>
          ) : isFreeGame && remainingDays !== null && (
            <div className="absolute top-0 right-0 bg-epicorange text-white text-xs font-bold p-2 m-2 rounded animate-pulse-slow">
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
            {isUpcoming ? (
              <div className="flex items-center space-x-2">
                <span className="line-through text-gray-400">
                  {game.price?.totalPrice?.originalPrice
                    ? `₺${(game.price.totalPrice.originalPrice / 100).toFixed(2)}`
                    : ""}
                </span>
                <span className="bg-epicaccent text-white px-2 py-1 rounded font-bold">YAKINDA</span>
              </div>
            ) : isFreeGame ? (
              <div className="flex items-center space-x-2">
                <span className="line-through text-gray-400">
                  {game.price?.totalPrice?.originalPrice
                    ? `₺${(game.price.totalPrice.originalPrice / 100).toFixed(2)}`
                    : ""}
                </span>
                <span className="bg-epicgreen text-white px-2 py-1 rounded font-bold">ÜCRETSİZ</span>
              </div>
            ) : (
              <span className="text-white">
                {game.price?.totalPrice?.originalPrice
                  ? `₺${(game.price.totalPrice.originalPrice / 100).toFixed(2)}`
                  : "Fiyat Bilgisi Yok"}
              </span>
            )}
          </div>
          
          {/* Tarih bilgisi */}
          {(startDate || endDate) && (
            <div className="text-sm text-gray-400 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {startDate && endDate 
                ? `${startDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')}`
                : startDate 
                ? `${startDate.toLocaleDateString('tr-TR')}'den itibaren` 
                : `${endDate?.toLocaleDateString('tr-TR')}'e kadar`}
            </div>
          )}
          
          {/* Oyun sağlayıcı bilgisi */}
          <div className="text-xs text-gray-500 mt-2">
            {game.seller?.name || (isSteamGame ? 'Steam' : 'Epic Games')}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GameCard; 