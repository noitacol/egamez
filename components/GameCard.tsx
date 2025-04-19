import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RxExternalLink } from 'react-icons/rx';
import { FaRegPlayCircle, FaRegMoneyBillAlt, FaFire, FaStopwatch, FaExternalLinkAlt, FaWindowMaximize, FaTimes, FaChevronRight, FaChevronLeft, FaSteam, FaGamepad, FaArrowLeft, FaArrowRight, FaApple, FaLinux, FaPlaystation, FaXbox, FaDesktop, FaChrome, FaArchive, FaPause, FaPlay } from 'react-icons/fa';
import { SiEpicgames } from 'react-icons/si';
import { IoLogoGameControllerB, IoMdClose, IoMdPricetag } from 'react-icons/io';
import { IoTime, IoWarningOutline, IoCalendarClearOutline, IoStopwatchOutline, IoPlanetOutline } from 'react-icons/io5';
import { MdClose, MdFreeBreakfast, MdMovie, MdImage, MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { FcClock } from 'react-icons/fc';
import { BiSolidTimeFive, BiSolidRightArrow, BiSolidLeftArrow } from 'react-icons/bi';
import { format, parseISO, differenceInDays, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn, calculateTimeLeft } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RxCross2 } from 'react-icons/rx';
import { ExtendedEpicGame } from '@/lib/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import clsx from 'clsx';
import { BsCalendar, BsFillPlayFill } from 'react-icons/bs';
import { FiExternalLink } from "react-icons/fi";
import { AiFillStar, AiOutlineInfoCircle, AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import PlatformIcon from './PlatformIcon';
import { HiOutlineTag, HiOutlineTrendingUp, HiOutlineExternalLink, HiOutlineShoppingCart, HiOutlineInformationCircle } from 'react-icons/hi';
import { RiGamepadLine } from "react-icons/ri";
import { BadgeDollarSign, BadgePercent, Calendar, CalendarDays, Clock, ExternalLink, Info, Tag, TrendingUp } from 'lucide-react';
import { GoDotFill } from 'react-icons/go';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlatformIcons } from '@/components/PlatformIcons';

// Medya öğesi tipleri
interface BaseMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
}

interface ImageMediaItem extends BaseMediaItem {
  type: 'image';
  alt: string;
}

interface VideoMediaItem extends BaseMediaItem {
  type: 'video';
  thumbnail: string;
  alt?: string;
}

type MediaItem = ImageMediaItem | VideoMediaItem;

// Bileşen özellikleri
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
  className?: string;
  showPlatform?: boolean;
  showDescription?: boolean;
  fullWidth?: boolean;
  showReleaseDate?: boolean;
  showMetacriticScore?: boolean;
  showPromotionalDates?: boolean;
  onClick?: () => void;
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
  className,
  showPlatform = true,
  showDescription = true,
  fullWidth = false,
  showReleaseDate = false,
  showMetacriticScore = false,
  showPromotionalDates = true,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('main');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const mediaGalleryRef = useRef<HTMLDivElement>(null);

  const isFreeGame = propIsFree !== undefined ? propIsFree : game.isFree;
  const isUpcomingGame = propIsUpcoming !== undefined ? propIsUpcoming : game.isUpcoming;
  
  const promotionEndDate = game.endDate || propEndDate;

  const getRemainingDays = (): number | null => {
    if (!game.promotions) return null;

    // Epic Games API formatı kontrolü
    if (isFreeGame && 
        game.promotions.promotionalOffers && 
        Array.isArray(game.promotions.promotionalOffers) &&
        game.promotions.promotionalOffers.length > 0 && 
        game.promotions.promotionalOffers[0]?.promotionalOffers?.length > 0) {
      const endDate = new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate);
      const now = new Date();
      return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Epic Games API formatı kontrolü - yakında ücretsiz olacaklar
    if (isUpcomingGame && 
        game.promotions.upcomingPromotionalOffers && 
        Array.isArray(game.promotions.upcomingPromotionalOffers) &&
        game.promotions.upcomingPromotionalOffers.length > 0 && 
        game.promotions.upcomingPromotionalOffers[0]?.promotionalOffers?.length > 0) {
      const startDate = new Date(game.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].startDate);
      const now = new Date();
      return Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Alternatif format - endDate kullanımı
    if (game.endDate) {
      const endDate = new Date(game.endDate);
      const now = new Date();
      return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
    ) || []).map(img => ({ 
      type: 'image' as const, 
      url: img.url, 
      id: `image-${img.url.substring(img.url.lastIndexOf('/') + 1)}`,
      alt: `${game.title} - ${img.type}`
    }) as ImageMediaItem),
    ...(game.videos || []).map(video => {
      const defaultThumbnail = getBestImage();
      return { 
        type: 'video' as const, 
        url: video.url, 
        thumbnail: video.thumbnail || defaultThumbnail,
        id: `video-${video.url.substring(video.url.lastIndexOf('/') + 1)}`,
        alt: `${game.title} video`
      } as VideoMediaItem;
    })
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

  const getPromotionalInfo = () => {
    if (!game.promotions) return { endDate: null, startDate: null, discountPercentage: null };

    // Şu anda ücretsiz ise, bitiş tarihini al
    if (isFreeGame && 
        game.promotions.promotionalOffers && 
        Array.isArray(game.promotions.promotionalOffers) &&
        game.promotions.promotionalOffers.length > 0 && 
        game.promotions.promotionalOffers[0]?.promotionalOffers?.length > 0) {
      const offer = game.promotions.promotionalOffers[0].promotionalOffers[0];
      return {
        endDate: offer.endDate,
        startDate: offer.startDate,
        discountPercentage: offer.discountSetting?.discountPercentage
      };
    }

    // Yakında ücretsiz olacaksa, başlangıç tarihini al
    if (isUpcomingGame && 
        game.promotions.upcomingPromotionalOffers && 
        Array.isArray(game.promotions.upcomingPromotionalOffers) &&
        game.promotions.upcomingPromotionalOffers.length > 0 && 
        game.promotions.upcomingPromotionalOffers[0]?.promotionalOffers?.length > 0) {
      const offer = game.promotions.upcomingPromotionalOffers[0].promotionalOffers[0];
      return {
        endDate: offer.endDate,
        startDate: offer.startDate,
        discountPercentage: offer.discountSetting?.discountPercentage
      };
    }

    return { endDate: null, startDate: null, discountPercentage: null };
  };

  const { endDate: promoEndDate, startDate: promoStartDate, discountPercentage: promoDiscountPercentage } = getPromotionalInfo();

  const calculateRemainingDays = (dateStr: string | null): number => {
    if (!dateStr) return 0;
    const endDate = new Date(dateStr);
    const now = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const calculateTemporaryFreeRemaining = (): { days: number, hours: number } => {
    const defaultResponse = { days: 0, hours: 0 };
    
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

  const getBestImage = (): string => {
    if (imgError || !game.keyImages || game.keyImages.length === 0) {
      return '/placeholder.webp';
    }

    const tallImage = game.keyImages.find(img => img.type === 'Tall');
    const wideImage = game.keyImages.find(img => img.type === 'DieselStoreFrontWide');
    const thumbnailImage = game.keyImages.find(img => img.type === 'Thumbnail');
    const defaultImage = game.keyImages[0];

    return (tallImage || wideImage || thumbnailImage || defaultImage).url;
  };

  const prepareMediaGallery = () => {
    const images = game.keyImages || [];
    const videos = game.videos || [];
    
    const imageItems: ImageMediaItem[] = images.map((img, index) => ({ 
      type: 'image' as const, 
      url: img.url, 
      id: `image-${index}`,
      alt: img.type || `${game.title} image ${index+1}`
    }));
    
    const videoItems: VideoMediaItem[] = videos.map((video, index) => {
      const thumbnail = video.thumbnail || getBestImage() || '/placeholder.jpg';
      return {
        type: 'video' as const,
        url: video.url,
        id: `video-${index}`,
        thumbnail,
        alt: `${game.title} video ${index+1}`
      };
    });

    return [...imageItems, ...videoItems] as MediaItem[];
  };

  const galleryMedia = prepareMediaGallery();

  const checkIsFree = () => {
    if (propIsFree !== undefined) return propIsFree;
    if (game.isFree !== undefined) return game.isFree;
    
    // Epic Oyunları için kontrol
    if (game.promotions && 
        game.promotions.promotionalOffers && 
        Array.isArray(game.promotions.promotionalOffers) &&
        game.promotions.promotionalOffers.length > 0 && 
        game.promotions.promotionalOffers[0]?.promotionalOffers?.length > 0) {
      const offer = game.promotions.promotionalOffers[0].promotionalOffers[0];
      return offer.discountSetting?.discountPercentage === 100;
    }
    
    // Steam oyunları ve diğerleri için price kontrolü
    if (game.price && typeof game.price === 'object') {
      return game.price.totalPrice?.discountPrice === 0 || game.price.totalPrice?.originalPrice === 0;
    }
    
    return false;
  };
  
  const checkIsUpcoming = () => {
    if (propIsUpcoming !== undefined) return propIsUpcoming;
    if (game.isUpcoming !== undefined) return game.isUpcoming;
    
    return game.promotions && 
           game.promotions.upcomingPromotionalOffers && 
           Array.isArray(game.promotions.upcomingPromotionalOffers) &&
           game.promotions.upcomingPromotionalOffers.length > 0 && 
           game.promotions.upcomingPromotionalOffers[0]?.promotionalOffers?.length > 0;
  };

  const getStoreUrl = () => {
    if (game.distributionPlatform === 'gamerpower' && game.url) {
      return game.url;
    } else if (game.distributionPlatform === 'steam' && game.url) {
      return game.url;
    } else {
      return `https://store.epicgames.com/tr/p/${game.productSlug || game.urlSlug}`;
    }
  };

  const getGamePrice = () => {
    if (!game.price || !game.price.totalPrice) return { finalPrice: 'Belirtilmemiş', originalPrice: '', hasDiscount: false };
    
    const totalPrice = game.price.totalPrice;
    let finalPrice = 'Ücretsiz';
    let originalPrice = '';
    let hasDiscount = false;
    
    const hasValidDiscount = typeof totalPrice.discount === 'number' && totalPrice.discount > 0;
    
    const hasValidDiscountPrice = typeof totalPrice.discountPrice === 'number';
    const hasValidOriginalPrice = typeof totalPrice.originalPrice === 'number';
    
    if (hasValidDiscount && hasValidDiscountPrice && hasValidOriginalPrice) {
      finalPrice = `₺${(totalPrice.discountPrice).toFixed(2)}`;
      originalPrice = `₺${(totalPrice.originalPrice).toFixed(2)}`;
      hasDiscount = true;
    } else if (hasValidOriginalPrice) {
      finalPrice = totalPrice.originalPrice === 0 
        ? 'Ücretsiz' 
        : `₺${(totalPrice.originalPrice).toFixed(2)}`;
    }
    
    return { finalPrice, originalPrice, hasDiscount };
  };

  const renderPlatformBadge = () => {
    if (!showPlatform) return null;

    // Platform bilgisini belirleyelim
    const platformName = game.platform || (propIsSteam ? 'steam' : propIsGamerPower ? 'gamerpower' : 'epic');

    return (
      <div className="absolute top-3 right-3 z-10">
        <Badge variant="outline" className="bg-black/80 text-white border-0 flex items-center gap-1">
          <PlatformIcon platform={platformName} className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">
            {platformName === 'steam' ? 'Steam' : 
             platformName === 'gamerpower' ? 'GamerPower' : 'Epic'}
          </span>
        </Badge>
      </div>
    );
  };

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
    
    if (isFreeGame && !isUpcomingGame && !temporaryFreeGame && remainingDays !== null && remainingDays > 0) {
      return (
        <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded flex items-center">
          Ücretsiz
          {remainingDays !== null && remainingDays > 0 && (
            <span className="ml-1">({remainingDays} gün kaldı)</span>
          )}
        </span>
      );
    }
    
    if (isUpcomingGame && remainingDays !== null && remainingDays > 0) {
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
    if (isFreeGame || isUpcomingGame) return true;
    if (game.endDate) return new Date(game.endDate) > new Date();
    return false;
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
    <>
      <Card className={cn(
        "group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all duration-300 hover:shadow-lg",
        isTrending && "border-amber-400",
        isUpcomingGame && "border-purple-400",
        className
      )}>
        {/* Bilgi etiketleri */}
        <div className="absolute left-0 top-0 z-10 flex p-2 gap-1.5">
          {/* Trending etiketi */}
          {isTrending && (
            <div className="flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              <HiOutlineTrendingUp className="h-3 w-3" />
              <span>Popüler</span>
            </div>
          )}
          
          {/* Geçici ücretsiz etiketi (Epic için) */}
          {isFreeGame && game.promotions?.promotionalOffers?.length > 0 && (
            <div className="flex items-center gap-1 rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              <MdFreeBreakfast className="h-3 w-3" />
              <span>Ücretsiz</span>
            </div>
          )}
          
          {/* Yakında ücretsiz etiketi */}
          {isUpcomingGame && (
            <div className="flex items-center gap-1 rounded bg-purple-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              <HiOutlineTag className="h-3 w-3" />
              <span>Yakında Ücretsiz</span>
            </div>
          )}
        </div>
        
        {/* Platform etiketi */}
        {renderPlatformBadge()}

        {/* Resim bölümü */}
        <div 
          className="relative overflow-hidden w-full cursor-pointer aspect-[16/9]" 
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
        </div>

        {/* Oyun Bilgileri */}
        <CardHeader className="flex-1 p-4">
          <CardTitle className="line-clamp-1 text-lg font-bold text-white">
            {game.title}
          </CardTitle>
          <div className="line-clamp-2 mt-1 text-sm text-gray-300">
            {game.description || 'Açıklama yok'}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          {/* Fiyatlandırma */}
          {!isUpcomingGame && !isFreeGame && game.price && (
            <div className="mt-2 flex flex-col">
              <div className="flex items-center gap-2">
                {game.price.totalPrice.discount > 0 && (
                  <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white">
                    -{game.price.totalPrice.discount}%
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  {game.price.totalPrice.discount > 0 && (
                    <span className="text-sm text-muted-foreground line-through">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(game.price.totalPrice.originalPrice)}
                    </span>
                  )}
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(game.price.totalPrice.discountPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="mt-auto flex justify-between p-4 pt-0">
          {game.metacritic?.score && (
            <a
              href={game.metacritic.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-300 hover:text-blue-400"
              tabIndex={0}
              aria-label={`Metacritic puanı: ${game.metacritic.score}`}
            >
              <span className={`font-bold ${
                game.metacritic.score >= 75 ? 'text-green-500' :
                game.metacritic.score >= 50 ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {game.metacritic.score}
              </span>
            </a>
          )}
        </CardFooter>
      </Card>

      {/* Gelişmiş Medya Galerisi Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm overscroll-none" onClick={handleCloseGallery}>
          <div className="relative w-full max-w-7xl max-h-[90vh] px-4" onClick={(e) => e.stopPropagation()}>
            {/* Modal kapatma butonu */}
            <button 
              onClick={handleCloseGallery}
              className="absolute -top-10 right-4 z-10 text-white hover:text-red-500 transition-colors"
              aria-label="Galeriyi kapat"
            >
              <IoMdClose className="w-6 h-6" />
            </button>
            
            {/* Medya içeriği */}
            <div className="relative flex flex-col items-center">
              <div className="relative w-full rounded-lg overflow-hidden bg-black/50 aspect-video">
                {mediaGallery.length > 0 && galleryMedia[currentMediaIndex] && (
                  galleryMedia[currentMediaIndex].type === 'image' ? (
                    <Image
                      src={galleryMedia[currentMediaIndex].url}
                      alt={galleryMedia[currentMediaIndex].alt || game.title}
                      className="w-full h-full object-contain"
                      width={1920}
                      height={1080}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full">
                      {isVideoPlaying ? (
                        <iframe
                          src={`${galleryMedia[currentMediaIndex].url}?autoplay=1&mute=0`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          className="w-full h-full"
                          title={`${game.title} trailer`}
                        ></iframe>
                      ) : (
                        <div 
                          className="relative w-full h-full flex items-center justify-center cursor-pointer"
                          onClick={() => setIsVideoPlaying(true)}
                        >
                          <Image
                            src={galleryMedia[currentMediaIndex].thumbnail || getBestImage()}
                            alt={`${game.title} video thumbnail`}
                            className="w-full h-full object-cover"
                            width={1920}
                            height={1080}
                            unoptimized
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <FaRegPlayCircle className="w-20 h-20 text-white/80 hover:text-white transition-colors" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
              
              {/* Medya kontrolleri */}
              <div className="mt-4 w-full flex items-center justify-between">
                <span className="text-white font-medium text-lg">
                  {game.title}{galleryMedia[currentMediaIndex]?.alt ? ` - ${galleryMedia[currentMediaIndex].alt}` : ''}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm">
                    {currentMediaIndex + 1} / {mediaGallery.length}
                  </span>
                  <button
                    onClick={() => navigateGallery('prev')}
                    className="p-2 rounded-full bg-gray-800/50 text-white hover:bg-gray-700/50 transition-colors"
                    aria-label="Önceki medya"
                  >
                    <MdNavigateBefore className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigateGallery('next')}
                    className="p-2 rounded-full bg-gray-800/50 text-white hover:bg-gray-700/50 transition-colors"
                    aria-label="Sonraki medya"
                  >
                    <MdNavigateNext className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Küçük resimler */}
              {mediaGallery.length > 1 && (
                <div className="mt-4 w-full grid grid-flow-col gap-2 overflow-x-auto pb-2 hide-scrollbar max-w-full">
                  {mediaGallery.map((media, idx) => (
                    <div 
                      key={media.id}
                      className={cn(
                        "relative cursor-pointer rounded-md overflow-hidden w-24 h-14 flex-shrink-0",
                        currentMediaIndex === idx && "ring-2 ring-blue-500"
                      )}
                      onClick={() => {
                        setIsVideoPlaying(false);
                        setCurrentMediaIndex(idx);
                      }}
                    >
                      <Image
                        src={media.type === 'video' ? media.thumbnail : media.url}
                        alt={media.alt || game.title}
                        className="w-full h-full object-cover"
                        width={96}
                        height={54}
                      />
                      {media.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <FaRegPlayCircle className="w-6 h-6 text-white/80" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameCard;