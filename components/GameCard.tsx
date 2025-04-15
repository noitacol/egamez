import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RxExternalLink } from 'react-icons/rx';
import { FaRegPlayCircle, FaRegMoneyBillAlt, FaFire, FaStopwatch, FaExternalLinkAlt, FaWindowMaximize, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { EpicGame } from '../lib/epic-api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// EpicGame tipini genişletiyoruz
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
  isFromSteam?: boolean; // Steam'den gelen oyunlar için
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
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const isTrendingGame = isTrending || game.isTrending || false;

  // Tarih kontrolü
  const currentDate = new Date();
  let startDate = null;
  let endDate = null;
  
  // Steam oyunu mu Epic oyunu mu kontrolü
  const isSteamGame = game.id?.toString().startsWith('steam_') || game.isFromSteam;
  
  // Çıkış yılı
  const releaseYear = game.releaseYear;
  
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
  const isFreeGame = isFree || (game.promotions?.promotionalOffers && 
    game.promotions.promotionalOffers.length > 0 &&
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

  // Find thumbnail image
  const thumbnailImage = game.keyImages?.find(
    (img) => img.type === "Thumbnail" || img.type === "OfferImageTall"
  );

  const tall = game.keyImages?.find((img) => img.type === "OfferImageTall");
  const wide = game.keyImages?.find((img) => img.type === "OfferImageWide");

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

  // Gallery media (images and videos)
  const galleryMedia = [
    ...(game.keyImages?.filter(
      (img) =>
        img.type === "Screenshot" ||
        img.type === "DieselGameBoxTall" ||
        img.type === "DieselGameBoxWide"
    ) || []),
    ...(game.videos || []),
  ];

  // İlgili URL'ler
  const isFromSteam = game.id.toString().includes("steam") || game.isFromSteam;
  const slugUrl = game.productSlug || game.urlSlug;
  const detailUrl = isFromSteam && slugUrl ? slugUrl : `https://store.epicgames.com/en-US/p/${slugUrl}`;

  return (
    <div
      className={`group relative h-full flex flex-col rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl ${
        isTrendingGame 
          ? "border-2 border-red-500/50 hover:border-red-500" 
          : isFreeGame 
            ? "border-2 border-epicblue/50 hover:border-epicblue" 
            : isUpcoming 
              ? "border-2 border-purple-500/50 hover:border-purple-500" 
              : "border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
      }`}
    >
      {/* Kartın üstündeki etiketler ve zamanlayıcı */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex justify-between items-center">
          <div>
            {isFreeGame ? (
              <span className="bg-epicblue text-white text-xs font-bold px-2 py-1 rounded">
                ÜCRETSİZ AL
              </span>
            ) : isUpcoming ? (
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                YAKINDA ÜCRETSİZ
              </span>
            ) : null}
          </div>
          {remainingDays !== null && (
            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
              {remainingDays} gün kaldı
            </span>
          )}
        </div>
      </div>

      {/* Oyun görüntüsü */}
      <div className="relative w-full overflow-hidden bg-gray-800 sm:aspect-[4/3] md:aspect-[3/4]">
        <Link href={`/game/${game.id}`} className="block relative h-full w-full">
          {imgError || !thumbnailImage ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 aspect-[3/4]">
              {game.title.charAt(0).toUpperCase()}
            </div>
          ) : (
            <>
              {/* Mobil ve tablette yatay, masaüstünde dikey görüntüler */}
              <div className="hidden md:block relative aspect-[3/4] w-full h-full">
                <Image
                  src={thumbnailImage.url}
                  alt={game.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={isFreeGame || isUpcoming}
                  onError={() => setImgError(true)}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <div className="md:hidden relative aspect-[16/9] w-full">
                {wide ? (
                  <Image
                    src={wide.url}
                    alt={game.title}
                    fill
                    sizes="(max-width: 768px) 100vw"
                    priority={isFreeGame || isUpcoming}
                    onError={() => setImgError(true)}
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <Image
                    src={thumbnailImage.url}
                    alt={game.title}
                    fill
                    sizes="(max-width: 768px) 100vw"
                    priority={isFreeGame || isUpcoming}
                    onError={() => setImgError(true)}
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                )}
              </div>
            </>
          )}
          
          {/* Görsel üzerindeki kaplama */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          
          {/* Galeri butonu */}
          {hasMedia && (
            <button
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                setShowGallery(true);
              }}
              aria-label="Galeriyi görüntüle"
            >
              <FaWindowMaximize className="w-3 h-3" />
            </button>
          )}
        </Link>
      </div>
      
      {/* Oyun bilgileri */}
      <div className="p-4 bg-white dark:bg-gray-800 flex-grow">
        <Link href={`/game/${game.id}`} className="block">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 hover:text-epicblue dark:hover:text-epicaccent transition-colors duration-200">
            {game.title}
          </h3>
        </Link>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {game.seller?.name || (isFromSteam ? "Steam" : "Epic Games")}
          </span>
          
          {metacriticScore && (
            <span 
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                metacriticScore >= 75 ? "bg-green-600 text-white" : 
                metacriticScore >= 60 ? "bg-yellow-500 text-white" : 
                "bg-red-500 text-white"
              }`}
            >
              {metacriticScore}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[2.5rem] mb-3">
          {game.description || "Açıklama bulunamadı."}
        </p>
        
        <div className="flex justify-between items-center mt-auto">
          <div>
            {game.price?.totalPrice && (
              <>
                {game.price.totalPrice.discount > 0 && !isFreeGame ? (
                  <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded mr-2">
                    -{game.price.totalPrice.discount}%
                  </span>
                ) : null}
                
                {!isFreeGame ? (
                  <div className="flex flex-col">
                    {game.price.totalPrice.discount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                        {(game.price.totalPrice.originalPrice / 100).toFixed(2)} TL
                      </span>
                    )}
                    <span className="text-gray-900 dark:text-white font-medium">
                      {(game.price.totalPrice.discountPrice / 100).toFixed(2)} TL
                    </span>
                  </div>
                ) : (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Ücretsiz
                  </span>
                )}
              </>
            )}
          </div>
          
          <Link
            href={detailUrl}
            target="_blank"
            className="flex items-center text-epicblue dark:text-epicaccent hover:underline text-sm"
            aria-label={`${game.title} detaylarını görüntüle`}
          >
            <span>Detaylar</span>
            <RxExternalLink className="ml-1 w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Medya Galeri Modalı */}
      {showGallery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowGallery(false)}
        >
          <div
            className="relative w-full max-w-4xl p-4 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-30 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
              onClick={() => setShowGallery(false)}
              aria-label="Galeriyi kapat"
            >
              <FaTimes className="text-white text-lg" />
            </button>
            
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              loop={galleryMedia.length > 1}
              initialSlide={currentMediaIndex}
              className="w-full h-full rounded-xl overflow-hidden"
              onSlideChange={(swiper) => setCurrentMediaIndex(swiper.activeIndex)}
            >
              {galleryMedia.map((media, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center">
                  {'url' in media ? (
                    <Image
                      src={media.url}
                      alt={`${game.title} - Görüntü ${index + 1}`}
                      width={1280}
                      height={720}
                      className="object-contain max-h-[80vh]"
                    />
                  ) : (
                    <div className="relative w-full aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${media.id}`}
                        title={`${game.title} - Video ${index + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      ></iframe>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
            
            <div className="mt-4 flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-bold">{game.title}</h3>
                <p className="text-sm text-gray-300">
                  {currentMediaIndex + 1} / {galleryMedia.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard; 