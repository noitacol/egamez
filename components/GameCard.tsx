import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RxExternalLink } from 'react-icons/rx';
import { FaRegPlayCircle, FaRegMoneyBillAlt, FaFire, FaStopwatch, FaExternalLinkAlt, FaWindowMaximize, FaTimes, FaChevronRight, FaChevronLeft, FaSteam, FaGamepad, FaArrowLeft, FaArrowRight, FaApple, FaLinux, FaPlaystation, FaXbox, FaDesktop, FaChrome, FaArchive } from 'react-icons/fa';
import { SiEpicgames } from 'react-icons/si';
import { IoLogoGameControllerB } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { ExtendedEpicGame } from '@/lib/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import clsx from 'clsx';
import { BsCalendar, BsFillPlayFill } from 'react-icons/bs';
import { format, differenceInDays, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { calculateTimeLeft } from '@/lib/utils';
import { IoMdClose } from 'react-icons/io';
import { BiSolidRightArrow, BiSolidLeftArrow } from "react-icons/bi";
import { FiExternalLink } from "react-icons/fi";
import { IoMdPricetag } from 'react-icons/io';
import { MdFreeBreakfast } from 'react-icons/md';
import { AiFillStar, AiOutlineInfoCircle } from "react-icons/ai";
import PlatformIcon from './PlatformIcon';
import { BiTimeFive } from 'react-icons/bi';
import { HiOutlineTag, HiOutlineTrendingUp, HiOutlineExternalLink, HiOutlineShoppingCart, HiOutlineInformationCircle } from 'react-icons/hi';
import { IoWarningOutline, IoCalendarClearOutline, IoStopwatchOutline, IoPlanetOutline } from 'react-icons/io5';

// Media öğesi tipi
interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  id: string;
  alt: string;
}

interface PromotionalOffer {
  startDate: string;
  endDate: string;
  discountSetting: {
    discountPercentage: number;
  };
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
  view?: 'grid' | 'list';
  isTrending?: boolean;
  useSmallCard?: boolean;
  temporaryFreeGame?: boolean;
  favorited?: boolean;
  showAddToFavorite?: boolean;
  onToggleFavorite?: (gameId: string) => void;
  endDate?: string;
  isFree?: boolean;
  isUpcoming?: boolean;
  trending?: boolean;
  isSteam?: boolean;
  isGamerPower?: boolean;
  showDetails?: boolean;
  showMedia?: boolean;
  isDetailPage?: boolean;
  onCardClick?: () => void;
  showStoreButton?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  view = 'grid',
  isTrending = false,
  useSmallCard = false,
  temporaryFreeGame = false,
  favorited = false,
  showAddToFavorite = false,
  onToggleFavorite,
  endDate: propEndDate,
  isFree: propIsFree,
  isUpcoming: propIsUpcoming,
  trending: propTrending,
  isSteam: propIsSteam,
  isGamerPower: propIsGamerPower,
  showDetails = true,
  showMedia = false,
  isDetailPage = false,
  onCardClick,
  showStoreButton = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('main');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Promosyon ve ücretsiz oyun bilgilerini hesapla
  const hasPromotion = 
    (game.price?.totalPrice && typeof game.price.totalPrice.discountPrice === 'number' && game.price.totalPrice.discountPrice === 0) || 
    game.isFree === true;
  const isFreeGame = propIsFree !== undefined ? propIsFree : hasPromotion || game.isFree === true;
  const isUpcoming = propIsUpcoming !== undefined ? propIsUpcoming : game.isUpcoming;
  
  // Promosyon bitiş tarihini hesapla
  const promotionEndDate = game.endDate || propEndDate;

  const getRemainingDays = (): number | null => {
    if (!game.promotions) return null;

    // Güncel promosyonlar için kalan gün sayısı
    if (isFreeGame && 
        game.promotions.promotionalOffers && 
        Array.isArray(game.promotions.promotionalOffers) &&
        game.promotions.promotionalOffers.length > 0 && 
        game.promotions.promotionalOffers[0]?.promotionalOffers?.length > 0) {
      const endDate = new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate);
      const now = new Date();
      return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Gelecek promosyonlar için kalan gün sayısı
    if (isUpcoming && 
        game.promotions.upcomingPromotionalOffers && 
        Array.isArray(game.promotions.upcomingPromotionalOffers) &&
        game.promotions.upcomingPromotionalOffers.length > 0 && 
        game.promotions.upcomingPromotionalOffers[0]?.promotionalOffers?.length > 0) {
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

  const mediaGallery: MediaItem[] = [
    ...(game.keyImages?.filter(img => 
      img.type !== 'Thumbnail' && 
      img.type !== 'VaultClosed' && 
      img.type !== 'DieselStoreFrontTall' &&
      img.url
    ) || []).map(img => ({ 
      type: 'image' as const, 
      url: img.url, 
      id: `image-${img.url.substring(img.url.lastIndexOf('/') + 1)}`,
      alt: `${game.title} - ${img.type}`
    })),
    ...(game.videos || []).map(video => ({ 
      type: 'video' as const, 
      url: video.url, 
      thumbnail: video.thumbnail, 
      id: `video-${video.url.substring(video.url.lastIndexOf('/') + 1)}`,
      alt: `${game.title} video`
    }))
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

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [showGallery]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
    if (Array.isArray(promoOffers) && promoOffers.length > 0) {
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
  const calculateRemainingDays = (dateStr: string | null): number => {
    if (!dateStr) return 0;
    const endDate = new Date(dateStr);
    const now = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Geçici ücretsiz oyunlar için kalan süreyi hesapla
  const calculateTemporaryFreeRemaining = (): { days: number, hours: number } => {
    const defaultResponse = { days: 0, hours: 0 };
    
    // Özelliğin var olup olmadığını kontrol et
    const endDateStr = game.endDate || propEndDate;
    if (!endDateStr) return defaultResponse;
    
    const endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) return defaultResponse;
    
    const now = new Date();
    if (endDate <= now) return defaultResponse;
    
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return {
      days: diffDays,
      hours: diffHours
    };
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
      ...images.map((img, index) => ({ 
        type: 'image' as const, 
        url: img.url, 
        id: `image-${index}`,
        alt: img.url || `${game.title} image ${index+1}`
      })),
      ...videos.map((video, index) => {
        // Video işleme kodu
        return {
          type: 'video' as const,
          url: video.url,
          id: `video-${index}`,
          thumbnail: video.thumbnail || ''
        };
      })
    ];

    return galleryMedia;
  };

  const galleryMedia = prepareMediaGallery();

  // Oyunun ücretsiz olup olmadığını kontrol et
  const checkIsFree = () => {
    // Override with prop if provided
    if (isFreeGame !== undefined) return isFreeGame;
    
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
    if (isUpcoming !== undefined) return isUpcoming;
    
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
    // Özellik kontrolü ve tip güvenliği için açıkça kontrol et
    if (game.distributionPlatform === 'gamerpower' && game.url) {
      return game.url;
    } else if (game.distributionPlatform === 'steam' && game.url) {
      return game.url; // Steam URL'ini kullan
    } else {
      // Epic Store URL'ini oluştur
      return `https://store.epicgames.com/tr/p/${game.productSlug || game.urlSlug}`;
    }
  };

  const getGamePrice = () => {
    if (!game.price || !game.price.totalPrice) return { finalPrice: 'Belirtilmemiş', originalPrice: '', hasDiscount: false };
    
    const totalPrice = game.price.totalPrice;
    let finalPrice = 'Ücretsiz';
    let originalPrice = '';
    let hasDiscount = false;
    
    // Discount kontrolü
    const hasValidDiscount = typeof totalPrice.discount === 'number' && totalPrice.discount > 0;
    
    // Fiyat kontrolü
    const hasValidDiscountPrice = typeof totalPrice.discountPrice === 'number';
    const hasValidOriginalPrice = typeof totalPrice.originalPrice === 'number';
    
    if (hasValidDiscount && hasValidDiscountPrice && hasValidOriginalPrice) {
      // İndirimli fiyat ve orijinal fiyat doğru şekilde göster
      finalPrice = `₺${(totalPrice.discountPrice).toFixed(2)}`;
      originalPrice = `₺${(totalPrice.originalPrice).toFixed(2)}`;
      hasDiscount = true;
    } else if (hasValidOriginalPrice) {
      // İndirim yoksa normal fiyatı göster
      finalPrice = totalPrice.originalPrice === 0 
        ? 'Ücretsiz' 
        : `₺${(totalPrice.originalPrice).toFixed(2)}`;
    }
    
    return { finalPrice, originalPrice, hasDiscount };
  };

  // Platform badge component
  const renderPlatformBadge = () => {
    // Dağıtım platformunu belirleme
    const platform = game.distributionPlatform || '';
    
    // GamerPower'dan gelen oyunlarda platformu belirle
    if (platform === 'gamerpower' || propIsGamerPower) {
      // Platformları kontrol et
      const gamePlatform = game.platform?.toLowerCase() || '';
      
      if (gamePlatform.includes('steam')) {
        return (
          <div className="absolute left-3 bottom-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#171a21] rounded-md font-medium text-xs text-white">
            <FaSteam className="text-white" size={14} />
            <span>Steam</span>
          </div>
        );
      } else if (gamePlatform.includes('epic') || gamePlatform.includes('egs')) {
        return (
          <div className="absolute left-3 bottom-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#2a2a2a] rounded-md font-medium text-xs text-white">
            <SiEpicgames className="text-white" size={14} />
            <span>Epic</span>
          </div>
        );
      } else if (gamePlatform.includes('playstation') || gamePlatform.includes('ps4') || gamePlatform.includes('ps5')) {
        return (
          <div className="absolute left-3 bottom-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#006FCD] rounded-md font-medium text-xs text-white">
            <FaPlaystation className="text-white" size={14} />
            <span>PlayStation</span>
          </div>
        );
      } else if (gamePlatform.includes('xbox')) {
        return (
          <div className="absolute left-3 bottom-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#107C10] rounded-md font-medium text-xs text-white">
            <FaXbox className="text-white" size={14} />
            <span>Xbox</span>
          </div>
        );
      } else if (gamePlatform.includes('pc')) {
        return (
          <div className="absolute left-3 bottom-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#0078D7] rounded-md font-medium text-xs text-white">
            <FaDesktop className="text-white" size={14} />
            <span>PC</span>
          </div>
        );
      } else {
        // Varsayılan olarak, platformun adını göster
        return (
          <div className="absolute left-3 bottom-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#555] rounded-md font-medium text-xs text-white">
            <FaGamepad className="text-white" size={14} />
            <span>{game.platform || 'Oyun'}</span>
          </div>
        );
      }
    } else if (platform === 'steam' || propIsSteam) {
      return (
        <div className="absolute left-3 bottom-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#171a21] rounded-md font-medium text-xs text-white">
          <FaSteam className="text-white" size={14} />
          <span>Steam</span>
        </div>
      );
    } else {
      return (
        <div className="absolute left-3 bottom-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#2a2a2a] rounded-md font-medium text-xs text-white">
          <SiEpicgames className="text-white" size={14} />
          <span>Epic</span>
        </div>
      );
    }
  };

  // Promosyon kalan zamanı göster
  const renderPromotionTimeRemaining = () => {
    if (temporaryFreeGame) {
      const { days, hours } = calculateTemporaryFreeRemaining();
      
      if (days > 0 || hours > 0) {
        return (
          <div className="absolute top-3 right-3 z-10 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
            <FaStopwatch className="mr-1" />
            {days > 0 ? `${days} gün ` : ''}{hours > 0 ? `${hours} saat` : ''}
          </div>
        );
      }
    }
    
    if (isFreeGame && !isUpcoming && !temporaryFreeGame && remainingDays !== null && remainingDays > 0) {
      return (
        <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded flex items-center">
          Ücretsiz
          {remainingDays !== null && remainingDays > 0 && (
            <span className="ml-1">({remainingDays} gün kaldı)</span>
          )}
        </span>
      );
    }
    
    if (isUpcoming && remainingDays !== null && remainingDays > 0) {
      return (
        <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded flex items-center">
          Yakında Ücretsiz
          {remainingDays !== null && remainingDays > 0 && (
            <span className="ml-1">({remainingDays} gün kaldı)</span>
          )}
        </span>
      );
    }
  };

  const isPromotionActive = () => {
    if (isFreeGame || isUpcoming) return true;
    if (game.endDate) return new Date(game.endDate) > new Date();
    return false;
  };

  // Medya galerisini kapat
  const closeGallery = () => {
    setShowGallery(false);
    setIsVideoPlaying(false);
  };

  // Medya galerisindeki öğeler arasında gezinme
  const navigateGallery = (direction: 'next' | 'prev') => {
    setIsVideoPlaying(false);
    if (direction === 'next') {
      setCurrentMediaIndex((prev) => (prev === mediaGallery.length - 1 ? 0 : prev + 1));
    } else {
      setCurrentMediaIndex((prev) => (prev === 0 ? mediaGallery.length - 1 : prev - 1));
    }
  };

  // Ana kart tıklama işleyicisi
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    } else if (showMedia && mediaGallery.length > 0) {
      setShowGallery(true);
    }
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
      {(isTrending || isFreeGame || isUpcoming || temporaryFreeGame) && (
        <div className="absolute top-0 left-0 z-10 flex gap-2 p-2">
          {isTrending && (
            <span className="bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded">
              Trend
            </span>
          )}
          
          {renderPromotionTimeRemaining()}
        </div>
      )}
      
      {/* Platform göstergesi - Eğer gelecekte değişebilir, şimdilik kapatıldı */}
      {/* 
      <div className="absolute top-0 right-0 z-10 p-2">
        <div className="flex bg-black/50 backdrop-blur-sm rounded-full p-1">
          {game.isSteam && (
            <FaSteam className="text-white w-4 h-4" />
          )}
        </div>
      </div>
      */}

      {/* Platform etiketi */}
      {renderPlatformBadge()}

      {/* Platform Rozeti */}
      {(propIsSteam || game.distributionPlatform === 'steam') && (
        <div className="absolute top-2 right-2 z-10 bg-black/70 rounded-full p-1.5">
          <FaSteam className="text-white text-lg" />
        </div>
      )}

      {/* GamerPower Rozeti */}
      {(propIsGamerPower || game.distributionPlatform === 'gamerpower') && (
        <div className="absolute top-2 right-2 z-10 bg-purple-600 rounded-full p-1.5">
          <FaGamepad className="text-white text-lg" />
        </div>
      )}

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
        <Link href={game.id ? `/game/${game.id}` : '#'} className="hover:underline">
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
            href={game.id ? `/game/${game.id}` : '#'}
            className="text-primary hover:underline text-sm font-medium flex items-center"
          >
            Detayları Gör
            <FaChevronRight className="ml-1 h-3 w-3" />
          </Link>
          
          {/* Fiyat Bilgisi */}
          <div className="text-right">
            {isFreeGame ? (
              <span className="text-green-600 font-semibold">Ücretsiz</span>
            ) : isUpcoming ? (
              <span className="text-blue-600 font-semibold">Yakında Ücretsiz</span>
            ) : game.price?.totalPrice?.discountPrice === 0 ? (
              <span className="text-green-600 font-semibold">Ücretsiz</span>
            ) : game.price?.totalPrice?.discountPrice !== game.price?.totalPrice?.originalPrice ? (
              <div className="flex flex-col">
                <span className="line-through text-gray-500 text-xs">
                  {game.price?.totalPrice?.originalPrice !== undefined
                    ? `₺${Number(game.price.totalPrice.originalPrice).toFixed(2)}`
                    : ''}
                </span>
                <span className="text-green-600 font-semibold">
                  {game.price?.totalPrice?.discountPrice !== undefined
                    ? `₺${Number(game.price.totalPrice.discountPrice).toFixed(2)}`
                    : 'Bilinmiyor'}
                </span>
              </div>
            ) : (
              <span className="font-semibold">
                {game.price?.totalPrice?.originalPrice !== undefined
                  ? `₺${Number(game.price.totalPrice.originalPrice).toFixed(2)}`
                  : 'Bilinmiyor'}
              </span>
            )}
          </div>
        </div>

        {/* Oyun kaynağı bilgisi */}
        <div className="flex items-center mt-2 space-x-1 text-xs text-gray-400">
          {game.distributionPlatform === 'gamerpower' && (
            <div className="flex items-center">
              {/* Platform'a göre ikon seç */}
              {game.platform?.toLowerCase().includes('steam') ? (
                <FaSteam className="mr-1" />
              ) : game.platform?.toLowerCase().includes('epic') ? (
                <SiEpicgames className="mr-1" />
              ) : game.platform?.toLowerCase().includes('playstation') || game.platform?.toLowerCase().includes('ps') ? (
                <FaPlaystation className="mr-1" />
              ) : game.platform?.toLowerCase().includes('xbox') ? (
                <FaXbox className="mr-1" />
              ) : (
                <FaGamepad className="mr-1" />
              )}
              <span>{game.platform || 'Oyun'}</span>
            </div>
          )}
          {game.distributionPlatform === 'steam' && (
            <div className="flex items-center">
              <FaSteam className="mr-1" />
              <span>Steam</span>
            </div>
          )}
          {(game.distributionPlatform === 'epic' || !game.distributionPlatform) && (
            <div className="flex items-center">
              <SiEpicgames className="mr-1" />
              <span>Epic Games</span>
            </div>
          )}
        </div>

        {/* Platform bilgisi */}
        <div className="mt-auto pt-2">
          {game.distributionPlatform === 'gamerpower' ? (
            <Link 
              href={game.url || '#'} 
              target="_blank" 
              className="inline-flex items-center text-sm text-indigo-500 hover:text-indigo-600"
            >
              {/* Platform'a göre metin seç */}
              {game.platform?.toLowerCase().includes('steam') ? (
                <><span>Steam'de Görüntüle</span><FaExternalLinkAlt size={12} className="ml-1" /></>
              ) : game.platform?.toLowerCase().includes('epic') ? (
                <><span>Epic Store'da Görüntüle</span><FaExternalLinkAlt size={12} className="ml-1" /></>
              ) : game.platform?.toLowerCase().includes('playstation') || game.platform?.toLowerCase().includes('ps') ? (
                <><span>PlayStation Store'da Görüntüle</span><FaExternalLinkAlt size={12} className="ml-1" /></>
              ) : game.platform?.toLowerCase().includes('xbox') ? (
                <><span>Xbox Store'da Görüntüle</span><FaExternalLinkAlt size={12} className="ml-1" /></>
              ) : (
                <><span>Detayları Gör</span><FaExternalLinkAlt size={12} className="ml-1" /></>
              )}
            </Link>
          ) : game.distributionPlatform === 'steam' ? (
            <Link href={`https://store.steampowered.com/app/${game.steamAppId}`} target="_blank" className="inline-flex items-center text-sm text-indigo-500 hover:text-indigo-600">
              <span>Steam'de Görüntüle</span>
              <FaExternalLinkAlt size={12} className="ml-1" />
            </Link>
          ) : (
            <Link href={game.url || '#'} target="_blank" className="inline-flex items-center text-sm text-indigo-500 hover:text-indigo-600">
              <span>Epic Store'da Görüntüle</span>
              <FaExternalLinkAlt size={12} className="ml-1" />
            </Link>
          )}
        </div>
      </div>

      {/* Kalan gün etiketini göster */}
      {(isFreeGame) && game.endDate && (
        <div className="absolute top-0 right-0 m-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <BiTimeFive className="mr-1" />
          <span>{calculateRemainingDays(game.endDate)} gün kaldı</span>
        </div>
      )}

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
              {galleryMedia.length > 0 && currentMediaIndex < galleryMedia.length && galleryMedia[currentMediaIndex]?.type === 'video' ? (
                <iframe
                  src={galleryMedia[currentMediaIndex]?.url || ''}
                  className="w-full h-full"
                  allowFullScreen
                  title={`${game.title} video ${currentMediaIndex + 1}`}
                ></iframe>
              ) : (
                <Image
                  src={galleryMedia.length > 0 && currentMediaIndex < galleryMedia.length ? galleryMedia[currentMediaIndex]?.url || '' : ''}
                  alt={`${game.title} görsel ${currentMediaIndex + 1}`}
                  className="object-contain max-h-full"
                  width={1200}
                  height={675}
                  unoptimized={true}
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