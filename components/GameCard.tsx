import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BsThermometerHigh } from 'react-icons/bs';
import { RxExternalLink } from 'react-icons/rx';
import { HiOutlinePhotograph } from 'react-icons/hi';
import { FaRegPlayCircle, FaRegMoneyBillAlt, FaFire, FaStopwatch, FaExternalLinkAlt, FaWindowMaximize, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { EpicGame } from '../lib/epic-api';
import { IconType } from 'react-icons';
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

  // Find thumbnail image
  const thumbnailImage = game.keyImages?.find(
    (img) => img.type === "Thumbnail" || img.type === "OfferImageTall"
  );

  const tall = game.keyImages?.find((img) => img.type === "OfferImageTall");
  const wide = game.keyImages?.find((img) => img.type === "OfferImageWide");

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

  // Galeride gösterilen öğeyi kapat
  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  // Galeriden sonraki öğeye geç
  const handleNextGalleryItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % allMedia.length);
  };

  // Galeriden önceki öğeye geç
  const handlePrevGalleryItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + allMedia.length) % allMedia.length);
  };

  const isFromSteam = game.id.toString().includes("steam") || game.isFromSteam;
  const slugUrl = game.productSlug || game.urlSlug;
  const detailUrl = isFromSteam && slugUrl ? slugUrl : `https://store.epicgames.com/en-US/p/${slugUrl}`;

  // React icon componentleri
  const ThermometerIcon = BsThermometerHigh as React.FC<React.SVGProps<SVGSVGElement>>;
  const PhotoIcon = HiOutlinePhotograph as React.FC<React.SVGProps<SVGSVGElement>>;
  const ExternalLinkIcon = RxExternalLink as React.FC<React.SVGProps<SVGSVGElement>>;
  const PlayCircleIcon = FaRegPlayCircle as React.FC<React.SVGProps<SVGSVGElement>>;

  return (
    <div
      className={`relative rounded-xl border overflow-hidden shadow-lg transition-transform hover:scale-[1.02] hover:z-10 bg-white dark:bg-gray-800 h-full flex flex-col ${
        isTrending ? "border-red-400" : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Promotional Labels */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
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

      {/* Game Image */}
      <div className="relative overflow-hidden aspect-[3/4] w-full">
        <div className="absolute inset-0 transition-opacity duration-200 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
        
        <button
          className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
          onClick={(e) => {
            e.preventDefault();
            setShowGallery(true);
          }}
          aria-label="View gallery"
        >
          <FaWindowMaximize className="text-white" />
        </button>
        
        <Link href={`/game/${game.id}`} passHref>
          {imgError || !thumbnailImage ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-gray-400 text-sm">Image not available</span>
            </div>
          ) : (
            <Image
              src={thumbnailImage.url}
              alt={game.title}
              className="object-cover hover:scale-105 transition-transform duration-300"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={isFreeGame || isUpcoming}
              onError={() => setImgError(true)}
            />
          )}
        </Link>
      </div>
      
      {/* Game Details */}
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

      {/* Media Gallery Modal */}
      {showGallery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setShowGallery(false)}
        >
          <div
            className="relative w-full max-w-4xl p-4 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-30 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
              onClick={() => setShowGallery(false)}
              aria-label="Close gallery"
            >
              <FaTimes className="text-white text-xl" />
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
                      alt={`${game.title} - Image ${index + 1}`}
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