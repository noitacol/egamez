import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BsThermometerHigh } from 'react-icons/bs';
import { RxExternalLink } from 'react-icons/rx';
import { HiOutlinePhotograph } from 'react-icons/hi';
import { FaRegPlayCircle } from 'react-icons/fa';
import { EpicGame } from '../lib/epic-api';
import { IconType } from 'react-icons';

// EpicGame tipini genişletiyoruz ve export ediyoruz
export interface ExtendedEpicGame extends EpicGame {
  videos?: Array<{
    id: string;
    thumbnail: string;
    urls?: {
      webm: {
        '480': string;
        max: string;
      };
      mp4: {
        '480': string;
        max: string;
      };
    };
  }>;
  metacritic?: number;
  isTrending?: boolean;
  releaseYear?: number;
  isTemporaryFree?: boolean; // Steam'de geçici olarak ücretsiz oyunlar için
}

interface GameCardProps {
  game: ExtendedEpicGame;
  isFree?: boolean;
  isUpcoming?: boolean;
  isTrending?: boolean; // Trend oyunlar için bayrak
}

const GameCard: React.FC<GameCardProps> = ({ game, isFree = false, isUpcoming = false, isTrending = false }) => {
  const [imgError, setImgError] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const isTrendingGame = isTrending || game.isTrending || false;

  // Tarih kontrolü
  const currentDate = new Date();
  let startDate = null;
  let endDate = null;
  
  // Steam oyunu mu Epic oyunu mu kontrolü
  const isSteamGame = game.id?.toString().startsWith('steam_');
  // Çıkış yılı
  const releaseYear = (game as any).releaseYear;
  // Metacritic puanı
  const metacriticScore = game.metacritic;
  
  if (isUpcoming && !isSteamGame && game.promotions) {
    // Yakında ücretsiz olacak oyunlar için
    const upcomingOffers = game.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers;
    startDate = upcomingOffers?.[0]?.startDate ? new Date(upcomingOffers[0].startDate) : null;
    endDate = upcomingOffers?.[0]?.endDate ? new Date(upcomingOffers[0].endDate) : null;
  } else if (!isSteamGame && game.promotions) {
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
  const isFreeGame = isFree || (game.promotions?.promotionalOffers?.length > 0 &&
    game.promotions.promotionalOffers[0]?.promotionalOffers?.some(
      (offer) => offer.discountSetting?.discountPercentage === 100
    ));

  // Oyunun mağaza URL'ini belirle
  const storeUrl = isSteamGame 
    ? game.productSlug || `https://store.steampowered.com/app/${game.id.toString().replace('steam_', '')}`
    : `https://store.epicgames.com/tr/p/${game.urlSlug || game.productSlug}`;

  // Oyunun ana kapak görselini bul
  const mainImage = game.keyImages?.find(
    (img) => img.type === "OfferImageWide" || img.type === "DieselStoreFrontWide"
  ) || game.keyImages?.[0];

  // Galeri görsellerini hazırla
  const galleryImages = game.keyImages?.filter(
    (img) => img.type !== "OfferImageWide" && img.type !== "DieselStoreFrontWide" && 
             img.type !== "DieselGameBoxTall" && img.type !== "Thumbnail"
  ) || [];

  // Video varsa galeri listesine ekle
  const videos = game.videos || [];
  const hasMedia = galleryImages.length > 0 || videos.length > 0;
  
  // Tüm medyayı birleştir
  const allMedia = [
    ...galleryImages,
    ...videos.map((video) => ({
      type: "Video",
      url: video.thumbnail || "",
      videoId: video.id
    }))
  ];

  // Galeride gösterilen öğeyi kapat
  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  // Galeriden sonraki öğeye geç
  const handleNextGalleryItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryIndex((prevIndex) => (prevIndex + 1) % allMedia.length);
  };

  // Galeriden önceki öğeye geç
  const handlePrevGalleryItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryIndex((prevIndex) => (prevIndex - 1 + allMedia.length) % allMedia.length);
  };

  const isFromSteam = game.id.toString().includes("steam");
  const slugUrl = game.productSlug || game.urlSlug;
  const detailUrl = isFromSteam && slugUrl ? slugUrl : `https://store.epicgames.com/en-US/p/${slugUrl}`;

  // React icon componentleri
  const ThermometerIcon = BsThermometerHigh as React.FC<React.SVGProps<SVGSVGElement>>;
  const PhotoIcon = HiOutlinePhotograph as React.FC<React.SVGProps<SVGSVGElement>>;
  const ExternalLinkIcon = RxExternalLink as React.FC<React.SVGProps<SVGSVGElement>>;
  const PlayCircleIcon = FaRegPlayCircle as React.FC<React.SVGProps<SVGSVGElement>>;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-700">
      {/* Kapak Görseli */}
      <div className="relative aspect-video overflow-hidden">
        {imgError ? (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <PhotoIcon className="w-20 h-20 text-gray-600" />
            <span className="absolute bottom-2 right-2 text-xs text-gray-500">{game.title}</span>
          </div>
        ) : (
          <Image
            src={mainImage?.url || "/placeholder.jpg"}
            alt={game.title}
            layout="fill"
            objectFit="cover"
            onError={() => setImgError(true)}
            className="transition-transform duration-500 hover:scale-110"
          />
        )}
        
        {/* Trend etiketi */}
        {isTrendingGame && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
            <ThermometerIcon className="mr-1" /> Trend
          </div>
        )}

        {/* Medya Galerisi Butonu */}
        {hasMedia && (
          <button 
            onClick={() => setShowGallery(true)}
            className="absolute top-2 right-2 bg-gray-800/70 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Medya galerisini göster"
          >
            <PhotoIcon className="w-5 h-5" />
          </button>
        )}

        {/* Promosyon Etiketi */}
        {(isFreeGame || isUpcoming) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-end justify-between">
              <div>
                {isFreeGame ? (
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                    ÜCRETSİZ AL
                  </span>
                ) : isUpcoming ? (
                  <span className="bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                    YAKINDA ÜCRETSİZ
                  </span>
                ) : null}
              </div>
              {remainingDays !== null && (
                <span className="text-white text-xs font-semibold">
                  {remainingDays} gün kaldı
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Oyun Bilgileri */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-1 truncate" title={game.title}>
          {game.title}
        </h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">
            {game.seller?.name || (isFromSteam ? "Steam" : "Epic Games")}
          </span>
          {metacriticScore && (
            <span className={`text-xs px-2 py-1 rounded font-bold ${
              metacriticScore > 75 ? "bg-green-600" : 
              metacriticScore > 60 ? "bg-yellow-600" : "bg-red-600"
            }`}>
              {metacriticScore}
            </span>
          )}
        </div>
        
        <p className="text-gray-300 text-sm line-clamp-2 h-10 mb-3">
          {game.description || "Açıklama bulunamadı."}
        </p>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            {game.price?.totalPrice && (
              <>
                {game.price.totalPrice.discount > 0 && !isFreeGame && (
                  <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded mr-2">
                    -{game.price.totalPrice.discount}%
                  </span>
                )}
                {!isFreeGame ? (
                  <div className="flex items-center">
                    {game.price.totalPrice.discount > 0 && (
                      <span className="text-gray-400 text-sm line-through mr-2">
                        {(game.price.totalPrice.originalPrice / 100).toFixed(2)} TL
                      </span>
                    )}
                    <span className="text-white font-bold">
                      {(game.price.totalPrice.discountPrice / 100).toFixed(2)} TL
                    </span>
                  </div>
                ) : (
                  <span className="text-green-500 font-bold">Ücretsiz</span>
                )}
              </>
            )}
          </div>
          
          <Link
            href={detailUrl}
            target="_blank"
            className="text-blue-400 flex items-center hover:text-blue-300 transition-colors"
            aria-label={`${game.title} detaylarını görüntüle`}
          >
            <ExternalLinkIcon className="w-5 h-5 mr-1" />
            <span className="text-sm">Detaylar</span>
          </Link>
        </div>
      </div>

      {/* Galeri Modal */}
      {showGallery && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={handleCloseGallery}
        >
          <div className="relative w-full max-w-4xl mx-auto">
            {/* Mevcut medya öğesi */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {allMedia[galleryIndex]?.type === "Video" ? (
                // Video ise
                <div className="w-full h-full relative">
                  <Image
                    src={allMedia[galleryIndex].url}
                    alt="Video önizleme"
                    layout="fill"
                    objectFit="contain"
                    className="max-h-[80vh]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <PlayCircleIcon className="w-16 h-16 text-white opacity-80" />
                  </div>
                </div>
              ) : (
                // Görsel ise
                <Image
                  src={allMedia[galleryIndex].url}
                  alt={`${game.title} görsel ${galleryIndex + 1}`}
                  layout="fill"
                  objectFit="contain"
                  className="max-h-[80vh]"
                />
              )}
              
              {/* Galeri Kontrolleri */}
              <button 
                onClick={handlePrevGalleryItem}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Önceki görsel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={handleNextGalleryItem}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Sonraki görsel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button 
                onClick={handleCloseGallery}
                className="absolute right-4 top-4 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Galeriyi kapat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* İlerleme Göstergesi */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-black/50 rounded-full px-3 py-1 text-sm text-white">
                  {galleryIndex + 1} / {allMedia.length}
                </div>
              </div>
            </div>
            
            {/* Küçük resim önizleme şeridi */}
            {allMedia.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto p-2 bg-gray-900/80 rounded-lg">
                {allMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryIndex(index);
                    }}
                    className={`flex-shrink-0 relative w-20 h-12 overflow-hidden rounded-md ${
                      index === galleryIndex ? "ring-2 ring-blue-500" : ""
                    }`}
                    aria-label={`${game.title} görsel ${index + 1}`}
                  >
                    <Image
                      src={media.url}
                      alt={`Küçük resim ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                    />
                    {media.type === "Video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <PlayCircleIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard; 