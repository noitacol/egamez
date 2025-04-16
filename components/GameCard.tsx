import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RxExternalLink } from 'react-icons/rx';
import { FaRegPlayCircle, FaRegMoneyBillAlt, FaFire, FaStopwatch, FaExternalLinkAlt, FaWindowMaximize, FaTimes, FaChevronRight, FaChevronLeft, FaSteam } from 'react-icons/fa';
import { HiOutlineTag, HiOutlineTrendingUp, HiOutlineExclamation } from 'react-icons/hi';
import { IoIosArrowRoundForward } from 'react-icons/io';
import { IoCloseCircle } from 'react-icons/io5';
import { SiEpicgames } from 'react-icons/si';
import { EpicGame } from '../lib/epic-api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import clsx from 'clsx';

// EpicGame tipinden oluşturulmuş genişletilmiş tip
export interface ExtendedEpicGame extends Omit<EpicGame, 'price'> {
  videos?: { id: string | number; name?: string; url: string }[];
  metacritic?: { score: number; url: string };
  isTemporaryFree?: boolean;
  isTrending?: boolean;
  isUpcoming?: boolean;
  isFree?: boolean;
  platform?: 'epic' | 'steam';
  distributionPlatform?: 'epic' | 'steam';
  price?: {
    totalPrice?: {
      discountPrice: number;
      originalPrice: number;
      discount: number;
      isFree?: boolean;
    };
    isFree?: boolean;
    finalPrice?: number;
    discount?: number;
  };
}

interface GameCardProps {
  game: ExtendedEpicGame;
  isFree?: boolean;
  isUpcoming?: boolean;
  isTrending?: boolean;
  showDetails?: boolean;
  displayType?: 'list' | 'grid';
  temporaryFreeGame?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  isFree: propIsFree,
  isUpcoming = false,
  isTrending = false,
  showDetails = true,
  displayType = 'grid',
  temporaryFreeGame = false
}) => {
  const [imgError, setImgError] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

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

  const { isFreeGame, isUpcomingFree, startDate, endDate } = getPromotionalInfo();

  // Promosyon bitişine kalan günleri hesapla
  const calculateRemainingDays = (endDate: Date | null): number => {
    if (!endDate) return 0;
    
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const remainingDays = calculateRemainingDays(endDate || startDate);

  // Oyun için en iyi resmi seç
  const getBestImage = (): string => {
    if (imgError || !game.keyImages || game.keyImages.length === 0) {
      return '/placeholder.webp'; // Placeholder resim yolu
    }

    // Öncelik sırasına göre resimleri al
    const tallImage = game.keyImages.find(img => img.type === 'Tall');
    const wideImage = game.keyImages.find(img => img.type === 'OfferImageWide');
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
      ...videos.map(video => ({ 
        type: 'video', 
        url: `https://www.youtube.com/embed/${video.id}`, 
        id: video.id 
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
    <div className={clsx(
      "group relative overflow-hidden rounded-lg bg-gray-900 transition-all duration-300 hover:shadow-xl",
      game.isTrending && "border-2 border-yellow-500",
      isFreeGame && "border-2 border-green-500",
      isUpcomingFree && "border-2 border-blue-500"
    )}>
      {/* Üst bilgi etiketleri */}
      <div className="absolute top-0 left-0 z-10 flex gap-2 p-2">
        {game.isTrending && (
          <span className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
            <HiOutlineTrendingUp className="mr-1 inline" />
            Trend
          </span>
        )}
        {isFreeGame && (
          <span className="rounded bg-green-500 px-2 py-1 text-xs font-bold text-black">
            <FaRegMoneyBillAlt className="mr-1 inline" />
            Ücretsiz
          </span>
        )}
        {isUpcomingFree && (
          <span className="rounded bg-blue-500 px-2 py-1 text-xs font-bold text-black">
            <FaStopwatch className="mr-1 inline" />
            Yakında
          </span>
        )}
        {game.isTemporaryFree && (
          <span className="rounded bg-purple-500 px-2 py-1 text-xs font-bold text-black">
            <HiOutlineTag className="mr-1 inline" />
            Geçici
          </span>
        )}
      </div>

      {/* Orta ekrandaki oyun kapak resmi */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={getBestImage()}
          alt={game.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="transition-transform duration-500 group-hover:scale-110"
          style={{ objectFit: 'cover' }}
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {renderPlatformBadge()}

        {/* Medya galerisi butonu */}
        {galleryMedia.length > 1 && (
          <button
            onClick={() => setShowGallery(true)}
            className="absolute bottom-4 right-4 rounded-full bg-black bg-opacity-70 p-2 text-white hover:bg-opacity-90"
            aria-label="Medya galerisini aç"
          >
            <FaRegPlayCircle size={24} />
          </button>
        )}

        {/* Promosyon süresi göstergesi */}
        {(isFreeGame || isUpcomingFree) && remainingDays > 0 && (
          <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-70 p-2 text-center text-sm font-bold text-white">
            {isFreeGame ? 'Bitiş' : 'Başlangıç'}: {remainingDays} gün kaldı
          </div>
        )}
      </div>

      {/* Oyun bilgileri */}
      <div className="p-4">
        <Link href={`/game/${game.id}`} className="group/title">
          <h3 className="mb-2 text-lg font-bold text-white transition-colors duration-200 group-hover/title:text-blue-400">
            {game.title}
          </h3>
        </Link>

        <p className="line-clamp-2 text-sm text-gray-300">{game.description || 'Açıklama bulunmuyor.'}</p>

        {/* Metacritic puanı */}
        {game.metacritic && (
          <div className={clsx(
            "mt-2 inline-block rounded px-2 py-1 text-sm font-bold",
            game.metacritic.score >= 75 ? "bg-green-600" : 
            game.metacritic.score >= 50 ? "bg-yellow-600" : "bg-red-600"
          )}>
            Metaskor: {game.metacritic.score}
          </div>
        )}

        {/* Dış bağlantılar */}
        <div className="mt-4 flex justify-between">
          <Link 
            href={`/game/${game.id}`} 
            className="inline-flex items-center rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Detaylar <FaChevronRight className="ml-1" />
          </Link>
          
          <a
            href={getStoreUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-gray-600"
          >
            Epic <FaExternalLinkAlt className="ml-1" />
          </a>
        </div>
      </div>

      {/* Medya galerisi modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full max-w-4xl">
            <button
              className="absolute right-4 top-4 z-10 rounded-full bg-white bg-opacity-20 p-2 text-white hover:bg-opacity-30"
              onClick={() => setShowGallery(false)}
              aria-label="Galeriyi kapat"
            >
              <FaTimes size={24} />
            </button>

            <div className="px-8 pb-4 pt-12">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                  prevEl: '.swiper-button-prev',
                  nextEl: '.swiper-button-next',
                }}
                pagination={{ clickable: true }}
                slidesPerView={1}
                initialSlide={0}
                onSlideChange={(swiper) => setCurrentMediaIndex(swiper.activeIndex)}
                className="h-full w-full"
              >
                {galleryMedia.map((media, index) => (
                  <SwiperSlide key={media.id}>
                    <div className="flex aspect-video w-full items-center justify-center">
                      {media.type === 'image' ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={media.url}
                            alt={`${game.title} görsel ${index + 1}`}
                            fill
                            style={{ objectFit: 'contain' }}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <iframe
                          src={media.url}
                          title={`${game.title} video ${index + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                        ></iframe>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="mt-4 flex items-center justify-between">
                <button className="swiper-button-prev z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30">
                  <FaChevronLeft size={20} />
                </button>
                <div className="text-center text-sm text-white">
                  {currentMediaIndex + 1} / {galleryMedia.length}
                </div>
                <button className="swiper-button-next z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30">
                  <FaChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard; 