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
import { motion } from 'framer-motion';
import { FiClock, FiX, FiChevronLeft, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import { SiEpicgames, SiSteam } from 'react-icons/si';
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { AiFillStar, AiOutlinePicture } from "react-icons/ai";
import { CiYoutube } from "react-icons/ci";
import { PiSealCheckFill } from "react-icons/pi";
import { FaPlay } from "react-icons/fa6";
import { BsWindowFullscreen } from "react-icons/bs";
import { PiTelevisionBold } from "react-icons/pi";
import { LuMouse } from "react-icons/lu";

// EpicGame'den türetilen ve Steam oyunları için de kullanılabilen genişletilmiş arayüz
export interface ExtendedEpicGame extends Omit<EpicGame, 'promotions'> {
  videos?: {
    type: string;
    url: string;
    thumbnail?: string;
  }[];
  metacritic?: {
    score: number;
    url: string;
  };
  isTrending?: boolean;
  isTempFree?: boolean;
  source?: 'epic' | 'steam';
  catalogNs?: {
    mappings?: any[];
  };
  offerMappings?: any[];
  promotions?: {
    promotionalOffers: {
      promotionalOffers: {
        startDate: string;
        endDate: string;
        discountSetting?: {
          discountPercentage: number;
        };
      }[];
    }[];
    upcomingPromotionalOffers: {
      promotionalOffers: {
        startDate: string;
        endDate: string;
        discountSetting?: {
          discountPercentage: number;
        };
      }[];
    }[];
  };
}

// GameCard bileşeni props arayüzü
interface GameCardProps {
  game: ExtendedEpicGame;
  isFree?: boolean;
  isUpcoming?: boolean;
  isTrending?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, isFree = false, isUpcoming = false, isTrending = false }) => {
  const [imgError, setImgError] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  
  // Oyunun promosyon değerinin kontrol edilmesi
  const hasPromotions = game.promotions && 
    (game.promotions.promotionalOffers?.length > 0 || 
     game.promotions.upcomingPromotionalOffers?.length > 0);
  
  // Oyunun ücretsiz olduğunu tespit etme
  const isFreeGame = isFree || (game.promotions?.promotionalOffers && 
    game.promotions.promotionalOffers.some(offer => 
      offer.promotionalOffers?.some(promo => {
        const now = new Date().getTime();
        const startDate = new Date(promo.startDate).getTime();
        const endDate = new Date(promo.endDate).getTime();
        return now >= startDate && now <= endDate;
      })
    ));

  // Şu anki tarih
  const now = new Date();

  // Fiyat metni oluşturma
  let priceText = "Ücretsiz";
  if (game.price && game.price.totalPrice && !game.price.totalPrice.discountPrice && game.price.totalPrice.originalPrice > 0) {
    priceText = `${(game.price.totalPrice.originalPrice / 100).toFixed(2)} TL`;
  } else if (game.price && game.price.totalPrice && game.price.totalPrice.discountPrice) {
    priceText = `${(game.price.totalPrice.discountPrice / 100).toFixed(2)} TL`;
  }

  // Kalan gün hesaplama
  let remainingDays = 0;
  if (isUpcoming && game.promotions?.upcomingPromotionalOffers && game.promotions.upcomingPromotionalOffers.length > 0) {
    const promo = game.promotions.upcomingPromotionalOffers[0].promotionalOffers?.[0];
    if (promo) {
      const startDate = new Date(promo.startDate);
      remainingDays = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  } else if (isFreeGame && hasPromotions) {
    const promo = game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
    if (promo) {
      const endDate = new Date(promo.endDate);
      remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  // Kapak görseli bulma
  const thumbnailImage = game.keyImages?.find(img => img.type === 'Thumbnail')?.url || 
                        game.keyImages?.find(img => img.type === 'DieselStoreFrontThumbnail')?.url ||
                        game.keyImages?.find(img => img.type === 'OfferImageTall')?.url;
                        
  const coverImage = game.keyImages?.find(img => img.type === 'DieselStoreFrontWide')?.url || 
                    game.keyImages?.find(img => img.type === 'OfferImageWide')?.url ||
                    game.keyImages?.find(img => ['Thumbnail', 'DieselStoreFrontThumbnail', 'OfferImageTall'].includes(img.type))?.url;
  
  // Oyun için medya galerisi oluşturma
  const galleryImages = game.keyImages?.filter(img => 
    !['Thumbnail', 'DieselStoreFrontThumbnail', 'OfferImageTall', 'DieselStoreFrontWide', 'OfferImageWide', 'Logo'].includes(img.type)
  ) || [];
  
  // Tüm medya içeriği (resimler + videolar)
  const allMedia = [
    ...galleryImages,
    ...(game.videos?.map(video => ({
      type: 'video',
      url: video.url,
      thumbnail: video.thumbnail
    })) || [])
  ];
  
  // Medya galerisi açıp kapatma
  const openGallery = () => setGalleryVisible(true);
  const closeGallery = () => setGalleryVisible(false);

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
      {/* Promosyon etiketleri */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {/* Trend etiketi */}
        {(isTrending || game.isTrending) && (
          <span className="flex items-center gap-1 bg-epicorange text-white px-2 py-1 rounded-md text-xs font-medium">
            <FaFire size={12} />
            Trend
          </span>
        )}
        
        {/* Ücretsiz etiketi */}
        {isFreeGame && (
          <span className="flex items-center gap-1 bg-epicblue text-white px-2 py-1 rounded-md text-xs font-medium">
            <FaRegMoneyBillAlt size={12} />
            Ücretsiz
          </span>
        )}
        
        {/* Yakında etiketi */}
        {isUpcoming && (
          <span className="flex items-center gap-1 bg-epicpurple text-white px-2 py-1 rounded-md text-xs font-medium">
            <FaStopwatch size={12} />
            Yakında
          </span>
        )}
      </div>
      
      {/* Platform etiketi */}
      {game.source && (
        <div className="absolute top-3 right-3 z-10">
          <span className={`flex items-center gap-1 ${game.source === 'epic' ? 'bg-epicblack' : 'bg-[#1b2838]'} text-white px-2 py-1 rounded-md text-xs font-medium`}>
            {game.source === 'epic' ? 'Epic' : 'Steam'}
          </span>
        </div>
      )}
      
      {/* Oyun resmi */}
      <div className="relative w-full h-48 overflow-hidden">
        <Link href={`/game/${game.id}${game.source ? `?source=${game.source}` : ''}`}>
          <div className="relative w-full h-full">
            {!imgError ? (
              <Image
                src={coverImage || '/img/placeholder.jpg'}
                alt={game.title}
                layout="fill"
                objectFit="cover"
                onError={() => setImgError(true)}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <Image
                src="/img/placeholder.jpg"
                alt={game.title}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </div>
        </Link>
        
        {/* Medya galerisi gösterme butonu */}
        {allMedia.length > 0 && (
          <button
            onClick={openGallery}
            className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
            aria-label="Medya galerisini göster"
          >
            <FaRegPlayCircle size={18} />
          </button>
        )}
      </div>
      
      {/* Oyun bilgileri */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/game/${game.id}${game.source ? `?source=${game.source}` : ''}`}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-epicblue dark:hover:text-epicaccent transition-colors line-clamp-2">
              {game.title}
            </h3>
          </Link>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {game.description || "Açıklama bulunmuyor."}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          {/* Fiyat veya süre bilgisi */}
          <div>
            {(isFreeGame || isUpcoming) && remainingDays > 0 && (
              <div className="flex items-center text-sm">
                <FaStopwatch className="mr-1 text-epicblue dark:text-epicaccent" size={14} />
                <span className="text-gray-700 dark:text-gray-300">
                  {remainingDays} gün kaldı
                </span>
              </div>
            )}
            
            {!isFreeGame && !isUpcoming && (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {priceText}
              </span>
            )}
          </div>
          
          {/* Metacritic puanı */}
          {game.metacritic?.score && (
            <a
              href={game.metacritic.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-bold px-2 py-1 rounded ${
                game.metacritic.score >= 75
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : game.metacritic.score >= 50
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {game.metacritic.score}
            </a>
          )}
        </div>
      </div>
      
      {/* Detay bağlantıları */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between">
        <Link href={`/game/${game.id}${game.source ? `?source=${game.source}` : ''}`}>
          <span className="text-sm text-epicblue dark:text-epicaccent hover:underline cursor-pointer flex items-center">
            Detaylar <FaExternalLinkAlt size={10} className="ml-1" />
          </span>
        </Link>
        
        <a
          href={game.source === 'steam' 
            ? `https://store.steampowered.com/app/${game.id}` 
            : `https://store.epicgames.com/tr/p/${game.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-epicblue dark:hover:text-epicaccent flex items-center"
        >
          Mağazada Gör <FaWindowMaximize size={10} className="ml-1" />
        </a>
      </div>
      
      {/* Medya galerisi modal */}
      {galleryVisible && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          {/* Kapatma butonu */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-10"
            aria-label="Galeriyi kapat"
          >
            <FaTimes size={20} />
          </button>
          
          {/* Oyun başlığı */}
          <div className="absolute top-4 left-4 z-10">
            <h3 className="text-white text-xl font-bold">{game.title}</h3>
          </div>
          
          {/* Swiper galerisi */}
          <div className="w-full max-w-4xl">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                prevEl: '.swiper-button-prev',
                nextEl: '.swiper-button-next',
              }}
              pagination={{ clickable: true }}
              className="mySwiper"
            >
              {allMedia.map((media, index) => (
                <SwiperSlide key={index}>
                  {media.type === 'video' ? (
                    <div className="relative aspect-video">
                      <iframe
                        src={media.url}
                        title={`Video ${index}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video flex items-center justify-center">
                      <Image
                        src={media.url}
                        alt={`${game.title} görsel ${index}`}
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Özel navigasyon butonları */}
            <div className="swiper-button-prev absolute top-1/2 left-4 z-10 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full">
              <FaArrowLeft size={20} />
            </div>
            <div className="swiper-button-next absolute top-1/2 right-4 z-10 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full">
              <FaArrowRight size={20} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard; 