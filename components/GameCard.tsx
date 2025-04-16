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
export interface ExtendedEpicGame extends EpicGame {
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
}

interface MediaItem {
  type: string;
  url: string;
  thumbnail?: string;
}

// GameCard bileşeni props arayüzü
interface GameCardProps {
  game: ExtendedEpicGame;
  isFree?: boolean;
  isUpcoming?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isFree = false, isUpcoming = false }) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
  
  // Promosyon bilgilerini kontrol et ve tarih bilgilerini hesapla
  const isFreeGame = isFree || game.price?.totalPrice?.discountPrice === 0;
  
  // Promosyonlar varsa ve promosyonlar içinde teklifler varsa devam et
  const hasPromotions = game.promotions && 
                      game.promotions.promotionalOffers && 
                      game.promotions.promotionalOffers.length > 0 &&
                      game.promotions.promotionalOffers[0].promotionalOffers &&
                      game.promotions.promotionalOffers[0].promotionalOffers.length > 0;

  const hasUpcomingPromotions = game.promotions && 
                              game.promotions.upcomingPromotionalOffers && 
                              game.promotions.upcomingPromotionalOffers.length > 0 &&
                              game.promotions.upcomingPromotionalOffers[0].promotionalOffers &&
                              game.promotions.upcomingPromotionalOffers[0].promotionalOffers.length > 0;

  // Kalan günleri hesapla
  const calculateRemainingDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  let startDate: string | undefined = undefined;
  let endDate: string | undefined = undefined;
  let discountPrice: number | undefined = undefined;
  let originalPrice: number | undefined = undefined;

  // Mevcut promosyonlar
  if (hasPromotions) {
    const offer = game.promotions.promotionalOffers[0].promotionalOffers[0];
    startDate = offer.startDate;
    endDate = offer.endDate;
  }
  
  // Gelecek promosyonlar
  if (hasUpcomingPromotions && isUpcoming) {
    const offer = game.promotions.upcomingPromotionalOffers[0].promotionalOffers[0];
    startDate = offer.startDate;
    endDate = offer.endDate;
  }

  // Fiyat bilgisini al
  if (game.price) {
    discountPrice = game.price.totalPrice?.discountPrice;
    originalPrice = game.price.totalPrice?.originalPrice;
  }

  // Kalan gün hesabı
  const remainingDays = (startDate && endDate) 
    ? calculateRemainingDays(startDate, endDate) 
    : 0;

  // Fiyat metni oluşturma
  let priceText = "Ücretsiz";
  if (game.price && game.price.totalPrice && !game.price.totalPrice.discountPrice && game.price.totalPrice.originalPrice > 0) {
    priceText = `${(game.price.totalPrice.originalPrice / 100).toFixed(2)} TL`;
  } else if (game.price && game.price.totalPrice && game.price.totalPrice.discountPrice) {
    priceText = `${(game.price.totalPrice.discountPrice / 100).toFixed(2)} TL`;
  }

  // Medya kaynakları oluşturma
  const mediaItems: MediaItem[] = [];

  // Ana kapak resmini ekle
  const coverImage = game.keyImages?.find(img => img.type === 'OfferImageWide' || img.type === 'DieselStoreFrontWide');
  if (coverImage) {
    mediaItems.push({
      type: 'image',
      url: coverImage.url,
    });
  }

  // Diğer resimleri ekle
  const otherImages = game.keyImages?.filter(img => 
    img.type === 'Screenshot' || 
    img.type === 'DieselGameMediaCarousel' || 
    img.type === 'ProductLogo'
  );
  
  if (otherImages) {
    otherImages.forEach(img => {
      mediaItems.push({
        type: 'image',
        url: img.url,
      });
    });
  }

  // Videoları ekle
  if (game.videos) {
    game.videos.forEach(video => {
      mediaItems.push({
        type: 'video',
        url: video.url,
        thumbnail: video.thumbnail || coverImage?.url,
      });
    });
  }

  // Medya galerisini aç
  const openGallery = () => {
    setShowGallery(true);
    document.body.style.overflow = 'hidden';
  };

  // Medya galerisini kapat
  const closeGallery = () => {
    setShowGallery(false);
    document.body.style.overflow = 'auto';
  };

  // İleri/geri navigasyonu
  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  // Klavye navigasyonu
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeGallery();
    } else if (e.key === 'ArrowRight') {
      nextMedia();
    } else if (e.key === 'ArrowLeft') {
      prevMedia();
    }
  };

  // Görüntü yükleme hatası
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <div
        className="relative flex flex-col overflow-hidden rounded-lg shadow-lg bg-gray-800 h-full transition-transform duration-300 hover:scale-[1.02]"
        data-testid="game-card"
      >
        <div className="relative w-full h-48 overflow-hidden">
          <Link href={`/game/${game.namespace}?source=${game.source || 'epic'}`}>
            <div className="relative w-full h-full group">
              {!imageError ? (
                <Image
                  src={coverImage?.url || '/img/placeholder.jpg'}
                  alt={game.title}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  priority
                />
              ) : (
                <Image
                  src="/img/placeholder.jpg"
                  alt={game.title}
                  fill
                  className="object-cover"
                />
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-white font-bold bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-full">
                  Detayları Gör
                </div>
              </div>
            </div>
          </Link>
          
          <button 
            onClick={openGallery}
            className="absolute bottom-2 right-2 z-10 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
            aria-label="Medya galerisini görüntüle"
          >
            <FaRegPlayCircle size={16} />
          </button>
          
          {game.isTrending && (
            <div className="absolute top-2 left-2 z-10 bg-red-600 text-white py-1 px-3 rounded-full flex items-center text-xs">
              <FaFire className="mr-1" size={12} />
              Trend
            </div>
          )}
          
          {isFreeGame && !isUpcoming && (
            <div className="absolute top-2 right-2 z-10 bg-green-600 text-white py-1 px-3 rounded-full flex items-center text-xs">
              <FaRegMoneyBillAlt className="mr-1" size={12} />
              Ücretsiz
            </div>
          )}
          
          {isUpcoming && (
            <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white py-1 px-3 rounded-full flex items-center text-xs">
              <FaStopwatch className="mr-1" size={12} />
              Yakında
            </div>
          )}
        </div>
        
        <div className="flex flex-col p-4 flex-grow">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{game.title}</h3>
          
          <p className="text-gray-300 text-sm line-clamp-3 mb-3">
            {game.description || 'Bu oyun için açıklama bulunmuyor.'}
          </p>
          
          <div className="mt-auto flex flex-col space-y-2">
            {game.metacritic && (
              <a
                href={game.metacritic.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-blue-400 flex items-center"
              >
                <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 ${
                  game.metacritic.score >= 75 ? 'bg-green-600' :
                  game.metacritic.score >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {game.metacritic.score}
                </span>
                <span>Metacritic</span>
                <RxExternalLink className="ml-1" size={14} />
              </a>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-300">
                {game.source === 'steam' ? (
                  <div className="flex items-center">
                    <FaWindowMaximize size={12} className="mr-1" />
                    <span>Steam</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaWindowMaximize size={12} className="mr-1" />
                    <span>Epic</span>
                  </div>
                )}
              </div>
              
              {isFreeGame && !isUpcoming && remainingDays > 0 && (
                <div className="text-green-400 flex items-center">
                  <FaStopwatch className="mr-1" size={12} />
                  <span>{remainingDays} gün kaldı</span>
                </div>
              )}
              
              {isUpcoming && remainingDays > 0 && (
                <div className="text-purple-400 flex items-center">
                  <FaStopwatch className="mr-1" size={12} />
                  <span>{remainingDays} gün sonra</span>
                </div>
              )}
              
              {!isFreeGame && !isUpcoming && (
                <div className="text-yellow-400 font-bold">
                  {priceText}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-3">
              <Link
                href={`/game/${game.namespace}?source=${game.source || 'epic'}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded"
              >
                Detaylar
              </Link>
              
              <a
                href={game.source === 'steam' ? 
                  `https://store.steampowered.com/app/${game.id}` : 
                  `https://store.epicgames.com/tr/p/${game.productSlug || game.urlSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
                aria-label="Mağazada aç"
              >
                <FaExternalLinkAlt size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Medya Galerisi Modalı */}
      {showGallery && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button 
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Galeriyi kapat"
          >
            <FaTimes size={24} />
          </button>
          
          <div className="relative w-full max-w-4xl max-h-[80vh] px-10">
            <button
              onClick={prevMedia}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 z-10"
              aria-label="Önceki medya"
            >
              <FaArrowLeft size={20} />
            </button>
            
            <button
              onClick={nextMedia}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 z-10"
              aria-label="Sonraki medya"
            >
              <FaArrowRight size={20} />
            </button>
            
            <div className="w-full h-full flex items-center justify-center">
              {mediaItems.length > 0 && (
                mediaItems[currentMediaIndex].type === 'video' ? (
                  <iframe
                    src={mediaItems[currentMediaIndex].url}
                    className="w-full max-h-[70vh]"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${game.title} video ${currentMediaIndex + 1}`}
                  />
                ) : (
                  <Image
                    src={mediaItems[currentMediaIndex].url}
                    alt={`${game.title} görsel ${currentMediaIndex + 1}`}
                    width={800}
                    height={450}
                    className="max-h-[70vh] w-auto mx-auto object-contain"
                  />
                )
              )}
            </div>
            
            <div className="mt-4">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView="auto"
                navigation
                pagination={{ clickable: true }}
                className="w-full"
              >
                {mediaItems.map((item, index) => (
                  <SwiperSlide key={index} className="w-auto h-20">
                    <button
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`h-full ${currentMediaIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      {item.type === 'video' ? (
                        <div className="relative h-full w-32">
                          <Image
                            src={item.thumbnail || '/img/placeholder.jpg'}
                            alt={`Thumbnail ${index}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <FaRegPlayCircle size={24} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-full w-32">
                          <Image
                            src={item.url}
                            alt={`Thumbnail ${index}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameCard; 