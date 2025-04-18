import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RxExternalLink } from 'react-icons/rx';
import { FaRegPlayCircle, FaRegMoneyBillAlt, FaFire, FaStopwatch, FaExternalLinkAlt, FaWindowMaximize, FaTimes, FaChevronRight, FaChevronLeft, FaSteam } from 'react-icons/fa';
import { HiOutlineTag, HiOutlineTrendingUp, HiOutlineExclamation } from 'react-icons/hi';
import { IoIosArrowRoundForward } from 'react-icons/io';
import { IoCloseCircle } from 'react-icons/io5';
import { SiEpicgames } from 'react-icons/si';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import clsx from 'clsx';
import { BsCalendar, BsFillPlayFill } from 'react-icons/bs';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { calculateTimeLeft } from '@/lib/utils';
import { ExtendedEpicGame } from '@/lib/types';
import { IoMdClose } from 'react-icons/io';
import { BiSolidRightArrow, BiSolidLeftArrow } from "react-icons/bi";
import { FiExternalLink } from "react-icons/fi";
import { IoMdPricetag } from 'react-icons/io';
import { MdFreeBreakfast } from 'react-icons/md';
import { AiFillStar, AiOutlineInfoCircle } from "react-icons/ai";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { FaPlay } from "react-icons/fa";
import { SiSteam } from "react-icons/si";

// Promosyonlar için tip tanımları
interface DiscountSetting {
  discountPercentage: number;
}

interface PromotionalOffer {
  startDate: string;
  endDate: string;
  discountSetting: DiscountSetting;
}

interface PromotionalOffers {
  promotionalOffers: PromotionalOffer[];
}

interface Promotions {
  promotionalOffers?: PromotionalOffers[];
  upcomingPromotionalOffers?: PromotionalOffers[];
}

interface GameCardProps {
  game: ExtendedEpicGame;
  isFree?: boolean;
  isUpcoming?: boolean;
  trending?: boolean;
  isSteam?: boolean;
  showDetails?: boolean;
  displayType?: 'list' | 'grid';
  temporaryFreeGame?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  isFree: propIsFree,
  isUpcoming = false,
  trending = false,
  isSteam = false,
  showDetails = true,
  displayType = 'grid',
  temporaryFreeGame = false
}) => {
  const [imgError, setImgError] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const isFreeGame = propIsFree !== undefined ? propIsFree : game.promotions?.promotionalOffers?.some(
    offer => offer.promotionalOffers?.some(
      promo => new Date(promo.startDate) <= new Date() && new Date(promo.endDate) >= new Date()
    )
  );

  const isUpcomingGame = isUpcoming !== undefined ? isUpcoming : game.promotions?.upcomingPromotionalOffers?.some(
    offer => offer.promotionalOffers?.some(
      promo => new Date(promo.startDate) > new Date()
    )
  );

  const getRemainingDays = (): number | null => {
    if (!game.promotions) return null;

    if (isFreeGame && game.promotions.promotionalOffers?.[0]?.promotionalOffers?.[0]) {
      const endDate = new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate);
      const now = new Date();
      return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (isUpcomingGame && game.promotions.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]) {
      const startDate = new Date(game.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].startDate);
      const now = new Date();
      return Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return null;
  };

  const keyImage = game.keyImages?.find(img => img.type === 'Thumbnail' || img.type === 'DieselStoreFrontWide')?.url 
    || game.keyImages?.[0]?.url 
    || '/placeholder.jpg';

  const coverImage = game.keyImages?.find(img => img.type === 'OfferImageTall' || img.type === 'DieselStoreFrontWide')?.url 
    || game.keyImages?.[0]?.url 
    || '/placeholder.jpg';

  const mediaGallery = [
    ...(game.keyImages?.filter(img => 
      img.type !== 'Thumbnail' && 
      img.type !== 'VaultClosed' && 
      img.type !== 'DieselStoreFrontTall' &&
      img.url
    ) || []).map(img => ({ type: 'image', url: img.url, id: `image-${img.url}` })),
    ...(game.videos || []).map(video => ({ type: 'video', url: video.url, thumbnail: video.thumbnail, id: video.id || `video-${video.url}` }))
  ];

  const handlePrevMedia = () => {
    setCurrentMediaIndex((currentMediaIndex - 1 + mediaGallery.length) % mediaGallery.length);
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((currentMediaIndex + 1) % mediaGallery.length);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCloseGallery();
    } else if (e.key === 'ArrowLeft') {
      handlePrevMedia();
    } else if (e.key === 'ArrowRight') {
      handleNextMedia();
    }
  };

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showGallery) {
        handleCloseGallery();
      }
    };

    if (showGallery) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [showGallery]);

  const remainingDays = getRemainingDays();
  const linkPath = `/game/${game.namespace || game.id || ''}/${game.productSlug || game.urlSlug || game.id}`;

  // Promosyon bilgilerini al
  const getPromotionalInfo = () => {
    if (!game.promotions) return { isFreeGame: false, isUpcomingFree: false, startDate: null, endDate: null };

    const promoOffers = game.promotions.promotionalOffers || [];
    const upcomingPromoOffers = game.promotions.upcomingPromotionalOffers || [];
    
    let isFreeGame = false;
    let isUpcomingFree = false;
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    // Şu an olan promosyonları kontrol et
    if (promoOffers.length > 0) {
      const currentPromotions = promoOffers[0]?.promotionalOffers || [];
      const freePromotion = currentPromotions.find(
        offer => offer.discountSetting?.discountPercentage === 100
      );

      if (freePromotion) {
        isFreeGame = true;
        startDate = freePromotion.startDate ? new Date(freePromotion.startDate) : null;
        endDate = freePromotion.endDate ? new Date(freePromotion.endDate) : null;
      }
    }

    // Gelecek promosyonları kontrol et
    if (!isFreeGame && upcomingPromoOffers.length > 0) {
      const futurePromotions = upcomingPromoOffers[0]?.promotionalOffers || [];
      const upcomingFreePromotion = futurePromotions.find(
        offer => offer.discountSetting?.discountPercentage === 100
      );

      if (upcomingFreePromotion) {
        isUpcomingFree = true;
        startDate = upcomingFreePromotion.startDate ? new Date(upcomingFreePromotion.startDate) : null;
        endDate = upcomingFreePromotion.endDate ? new Date(upcomingFreePromotion.endDate) : null;
      }
    }

    return {
      isFreeGame,
      isUpcomingFree,
      startDate,
      endDate
    };
  };

  const { isFreeGame: promoIsFreeGame, isUpcomingFree: promoIsUpcomingFree, startDate: promoStartDate, endDate: promoEndDate } = getPromotionalInfo();

  // Kalan günleri hesaplama fonksiyonunu güncelle
  const calculateRemainingDays = (endDate: Date | null): number => {
    if (!endDate) return 0;
    
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Geçici ücretsiz oyunlar için kalan süreyi hesapla
  const calculateTemporaryFreeRemaining = (): { days: number, hours: number } => {
    if (!game.promotionEndDate) return { days: 0, hours: 0 };
    
    const now = new Date();
    const endDate = new Date(game.promotionEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    
    if (diffTime <= 0) return { days: 0, hours: 0 };
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days: diffDays, hours: diffHours };
  };

  const tempFreeRemaining = calculateTemporaryFreeRemaining();

  // Oyun için en iyi resmi seç
  const getBestImage = (): string => {
    if (imgError || !game.keyImages || game.keyImages.length === 0) {
      return '/placeholder.webp'; // Placeholder resim yolu
    }

    // Öncelik sırasına göre resimleri al
    const tallImage = game.keyImages.find(img => img.type === 'Tall');
    const wideImage = game.keyImages.find(img => img.type === 'DieselStoreFrontWide');
    const thumbnailImage = game.keyImages.find(img => img.type === 'Thumbnail');
    const defaultImage = game.keyImages[0];

    return (tallImage || wideImage || thumbnailImage || defaultImage).url;
  };

  // Medya galerisi için tüm resimleri ve videoları hazırla
  const prepareMediaGallery = () => {
    const images = game.keyImages || [];
    const videos = game.videos || [];

    const galleryMedia = [
      ...images.map((img, index) => ({ type: 'image', url: img.url, id: `image-${index}` })),
      ...videos.map((video, index) => ({ 
        type: 'video', 
        url: `https://www.youtube.com/embed/${video.id || ''}`, 
        id: video.id || `video-${index}` 
      }))
    ];

    return galleryMedia;
  };

  const galleryMedia = prepareMediaGallery();

  // Oyunun ücretsiz olup olmadığını kontrol et
  const checkIsFree = () => {
    // Override with prop if provided
    if (propIsFree !== undefined) return propIsFree;
    
    // Check if game has promotions property
    if (!game.promotions) return false;

    // Check if game has valid promotional offers
    const promotionalOffers = game.promotions.promotionalOffers || [];
    if (promotionalOffers.length === 0) return false;

    const currentOffers = promotionalOffers[0]?.promotionalOffers || [];
    return currentOffers.some(offer => offer.discountSetting?.discountPercentage === 100);
  };

  // Oyunun yakında ücretsiz olup olmadığını kontrol et
  const checkIsUpcoming = () => {
    // Override with prop if provided
    if (isUpcoming) return true;
    
    // Check if game has promotions property
    if (!game.promotions) return false;

    // Check if game has valid upcoming promotional offers
    const upcomingOffers = game.promotions.upcomingPromotionalOffers || [];
    if (upcomingOffers.length === 0) return false;

    const nextOffers = upcomingOffers[0]?.promotionalOffers || [];
    return nextOffers.some(offer => offer.discountSetting?.discountPercentage === 100);
  };

  // Oyunun istors linkini oluştur
  const getStoreUrl = () => {
    if (!game) return '#';
    
    // Epic Games standart URL formatı
    const namespace = game.namespace || '';
    const slug = game.productSlug || game.urlSlug || '';
    
    if (namespace && slug) {
      return `https://store.epicgames.com/tr/p/${slug}`;
    }
    
    // Steam linkleri için
    if (game.id && game.id.toString().startsWith('steam_')) {
      const steamId = game.id.toString().replace('steam_', '');
      return `https://store.steampowered.com/app/${steamId}`;
    }
    
    return '#';
  };

  const getGamePrice = () => {
    if (!game.price) return { finalPrice: 'Belirtilmemiş', originalPrice: '', hasDiscount: false };
    
    const totalPrice = game.price.totalPrice;
    let finalPrice = 'Ücretsiz';
    let originalPrice = '';
    let hasDiscount = false;
    
    if (totalPrice) {
      // Fiyat alanları doğru formatta çıktı oluştur
      finalPrice = totalPrice.originalPrice !== 0 
        ? `₺${totalPrice.originalPrice}` 
        : 'Ücretsiz';
      
      if (totalPrice.discount > 0) {
        originalPrice = `₺${totalPrice.discountPrice}`;
        hasDiscount = true;
      }
    }
    
    return { finalPrice, originalPrice, hasDiscount };
  };

  // Platform badge component
  const renderPlatformBadge = () => {
    const platform = game.distributionPlatform || game.platform || 'epic';
    
    return (
      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full p-1.5 text-white" title={`Platform: ${platform === 'epic' ? 'Epic Games' : 'Steam'}`}>
        {platform === 'epic' ? 
          <SiEpicgames className="h-4 w-4" /> : 
          <FaSteam className="h-4 w-4" />
        }
      </div>
    );
  };

  // Oyun kartı oluştur
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col bg-card border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden h-full"
    >
      {/* Üst Etiket - Trending, Ücretsiz veya Yakında */}
      {(game.trending || isFreeGame || isUpcomingGame) && (
        <div className="absolute top-0 left-0 z-10 flex gap-2 p-2">
          {game.trending && (
            <span className="bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded">
              Trend
            </span>
          )}
          
          {isFreeGame && !isUpcomingGame && (
            <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded flex items-center">
              Ücretsiz
              {remainingDays !== null && remainingDays > 0 && (
                <span className="ml-1">({remainingDays} gün kaldı)</span>
              )}
            </span>
          )}
          
          {isUpcomingGame && (
            <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded flex items-center">
              Yakında Ücretsiz
              {remainingDays !== null && remainingDays > 0 && (
                <span className="ml-1">({remainingDays} gün kaldı)</span>
              )}
            </span>
          )}
        </div>
      )}
      
      {/* Platform göstergesi */}
      <div className="absolute top-0 right-0 z-10 p-2">
        <div className="flex bg-black/50 backdrop-blur-sm rounded-full p-1">
          {isSteam && (
            <FaSteam className="text-white w-4 h-4" />
          )}
        </div>
      </div>

      {/* Resim Bölümü */}
      <div 
        className="relative overflow-hidden aspect-[16/9] w-full cursor-pointer"
        onClick={() => setShowGallery(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowGallery(true);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${game.title} resim galerisi`}
      >
        {!imgError && keyImage ? (
          <Image
            src={keyImage}
            alt={game.title || 'Oyun görseli'}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            width={600}
            height={338}
            onError={() => setImgError(true)}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88/HjfwAJZwPXyjQCJwAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
            <span className="text-gray-400 text-lg">Resim Yüklenemedi</span>
          </div>
        )}
        
        {/* Resim üzerindeki galeriye git butonu */}
        {galleryMedia.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full px-2 py-1 text-xs backdrop-blur-sm">
            {galleryMedia.length} görsel
          </div>
        )}
      </div>

      {/* Oyun Bilgileri */}
      <div className="flex flex-col p-4 flex-grow">
        <Link href={`/game/${game.id}`} className="hover:underline">
          <h3 className="text-lg font-semibold line-clamp-1">{game.title}</h3>
        </Link>
          
        {/* Metacritic Puanı */}
        {game.metacritic && (
          <div className="mt-1 flex items-center">
            <div 
              className={`w-8 h-8 flex items-center justify-center font-bold text-white text-sm rounded ${
                game.metacritic.score >= 75 ? 'bg-green-600' : 
                game.metacritic.score >= 50 ? 'bg-yellow-500' : 'bg-red-600'
              }`}
            >
              {game.metacritic.score}
            </div>
            <span className="ml-2 text-xs text-gray-500">Metacritic</span>
          </div>
        )}
        
        {/* Açıklama */}
        <p className="mt-2 text-sm text-gray-600 line-clamp-2 flex-grow">
          {game.description || 'Bu oyun için açıklama bulunmamaktadır.'}
        </p>
        
        {/* Detay Linkine Git Butonu */}
        <div className="flex items-center justify-between mt-4">
          <Link 
            href={`/game/${game.id}`}
            className="text-primary hover:underline text-sm font-medium flex items-center"
          >
            Detayları Gör
            <FaChevronRight className="ml-1 h-3 w-3" />
          </Link>
          
          {/* Fiyat Bilgisi */}
          <div className="text-right">
            {isFreeGame ? (
              <span className="text-green-600 font-semibold">Ücretsiz</span>
            ) : isUpcomingGame ? (
              <span className="text-blue-600 font-semibold">Yakında Ücretsiz</span>
            ) : game.price?.totalPrice?.discountPrice === 0 ? (
              <span className="text-green-600 font-semibold">Ücretsiz</span>
            ) : game.price?.totalPrice?.discountPrice !== game.price?.totalPrice?.originalPrice ? (
              <div className="flex flex-col">
                <span className="line-through text-gray-500 text-xs">
                  {game.price?.totalPrice?.originalPrice 
                    ? `₺${(game.price.totalPrice.originalPrice / 100).toFixed(2)}`
                    : ''}
                </span>
                <span className="text-green-600 font-semibold">
                  {game.price?.totalPrice?.discountPrice 
                    ? `₺${(game.price.totalPrice.discountPrice / 100).toFixed(2)}`
                    : 'Bilinmiyor'}
                </span>
              </div>
            ) : (
              <span className="font-semibold">
                {game.price?.totalPrice?.originalPrice 
                  ? `₺${(game.price.totalPrice.originalPrice / 100).toFixed(2)}`
                  : 'Bilinmiyor'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Medya Galerisi Modal */}
      {showGallery && galleryMedia.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={handleCloseGallery}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div 
            className="relative w-full max-w-5xl h-full max-h-[80vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat Butonu */}
            <button 
              onClick={handleCloseGallery}
              className="absolute top-2 right-2 z-50 bg-black/50 text-white p-2 rounded-full"
              aria-label="Galeriyi kapat"
            >
              <IoMdClose className="w-6 h-6" />
            </button>
            
            {/* Ana Medya */}
            <div className="w-full h-full flex items-center justify-center">
              {galleryMedia[currentMediaIndex].type === 'video' ? (
                <iframe
                  src={galleryMedia[currentMediaIndex].url}
                  className="w-full h-full"
                  allowFullScreen
                  title={`${game.title} video ${currentMediaIndex + 1}`}
                ></iframe>
              ) : (
                <Image
                  src={galleryMedia[currentMediaIndex].url}
                  alt={`${game.title} görsel ${currentMediaIndex + 1}`}
                  className="object-contain max-h-full"
                  width={1200}
                  height={675}
                />
              )}
            </div>
            
            {/* Navigasyon Butonları */}
            {galleryMedia.length > 1 && (
              <>
                <button 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full"
                  onClick={handlePrevMedia}
                  aria-label="Önceki görsel"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
                <button 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full"
                  onClick={handleNextMedia}
                  aria-label="Sonraki görsel"
                >
                  <FaArrowRight className="w-5 h-5" />
                </button>
                
                {/* Sayfa göstergesi */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white rounded-full px-3 py-1 text-sm">
                  {currentMediaIndex + 1} / {galleryMedia.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GameCard; 