import { GetStaticProps } from "next";
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
// Epic API çağrıları geçici olarak devre dışı bırakıldı
// import { fetchFreeGames, fetchUpcomingFreeGames, fetchTrendingGames } from "@/lib/epic-api";
import { 
  getGamerPowerOnlyGamesAsEpicFormat, 
  getGamerPowerLootAsEpicFormat, 
  getGamerPowerBetaAsEpicFormat, 
  getTrendingGamerPowerGames 
} from "@/lib/gamerpower-api";
import { getFreeSteamGames, getTrendingSteamGames } from "@/lib/steam-api";
import FreeGamesList from "@/components/FreeGamesList";
import GameCard from "@/components/GameCard";
import { ExtendedEpicGame } from "@/lib/types";
import { SiEpicgames, SiSteam, SiNintendoswitch, SiGogdotcom, SiAndroid, SiApple } from "react-icons/si";
import { FaPlaystation, FaXbox, FaWindows, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaGamepad, FaFire } from "react-icons/fa";
import { RiGamepadLine } from "react-icons/ri";
import { GiRaceCar, GiSwordman, GiSpellBook, GiMountainRoad, GiChessKnight } from "react-icons/gi";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { MdNavigateNext, MdNavigateBefore, MdOutlineAccessTime } from "react-icons/md";
import { BsGift } from "react-icons/bs";
import { RiTestTubeFill } from "react-icons/ri";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BiGift } from "react-icons/bi";

interface HomeProps {
  // Epic API oyunları geçici olarak kaldırıldı
  // epicFreeGames: ExtendedEpicGame[];
  // upcomingEpicGames: ExtendedEpicGame[];
  freebieGames: ExtendedEpicGame[];
  freeLoots: ExtendedEpicGame[];
  freeBetas: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  trendingGames: ExtendedEpicGame[];
  totalGames: number;
}

export default function Home({ 
  // Epic API oyunları geçici olarak kaldırıldı
  // epicFreeGames, 
  // upcomingEpicGames, 
  freebieGames,
  freeLoots,
  freeBetas,
  steamFreeGames,
  trendingGames,
  totalGames 
}: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'free' | 'upcoming' | 'trending' | 'loot' | 'beta'>('free');
  const [featuredGames, setFeaturedGames] = useState<ExtendedEpicGame[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [activePlatform, setActivePlatform] = useState<'all' | 'steam' | 'playstation' | 'xbox' | 'switch' | 'pc' | 'android' | 'ios'>('all');
  const [filter, setFilter] = useState<"all" | "steam">("all");
  const [sort, setSort] = useState<"none" | "title" | "price">("none");

  // Steam ve Epic platformlarındaki oyunları topla ve öne çıkan oyunlar listesini oluştur
  useEffect(() => {
    // Tüm oyunları içeren bir dizi oluştur - sadece gerçek oyunları al (loot ve beta olmayanlar)
    const allGames = [...freebieGames, ...trendingGames, ...steamFreeGames];
    
    // Sadece Steam veya Epic oyunlarını filtrele
    const steamAndEpicGames = allGames.filter(game => {
      if (!game) return false;
      
      // Sadece Steam veya Epic platformundaki oyunları al
      const platform = game.distributionPlatform?.toLowerCase() || '';
      
      // loot veya beta olanları hariç tut
      const isLoot = game.isLoot || game.offerType === 'loot';
      const isBeta = game.isBeta || game.offerType === 'beta';
      
      // Sadece gerçek oyunları dahil et (loot ve beta olmayanlar)
      return (platform === 'steam' || platform === 'epic') && !isLoot && !isBeta;
    });
    
    // Öne çıkan oyunların listesini benzersiz olacak şekilde oluştur
    const uniqueGames = steamAndEpicGames.filter((game, index, self) => 
      index === self.findIndex(g => g.id === game.id)
    );
    
    // Rastgele sırala ve en fazla 10 oyun göster
    const shuffled = [...uniqueGames].sort(() => 0.5 - Math.random());
    setFeaturedGames(shuffled.slice(0, 10));
  }, [freebieGames, trendingGames, steamFreeGames]);

  // Bir oyun için en kaliteli kapak görselini seç
  const getBestGameImage = (game: ExtendedEpicGame): string => {
    if (!game || !game.keyImages || game.keyImages.length === 0) {
      return '/placeholder.jpg';
    }

    // Tercih edilen görsel tiplerine göre sırala
    const preferredTypes = [
      'OfferImageWide', // Geniş banner görsel
      'DieselStoreFrontWide', // Epic Store'da kullanılan geniş görsel
      'Screenshot', // Ekran görüntüsü - daha detaylı
      'Thumbnail', // Küçük görsel genelde daha yüksek kalite olur
      'VaultClosed', // Epic'in bazı oyunlar için özel banner'ı 
      'DieselGameBox', // Oyun kutusu görseli - detaylı
      'DieselGameBoxTall', // Dikey oyun kutusu - detaylı
      'DieselGameBoxLogo', // Logo - genelde düşük kalite
      'cover', // GamerPower'dan gelen kapak görseli
      'thumbnail' // GamerPower'dan gelen küçük görsel
    ];

    // Önce tercih edilen tiplere göre ara
    for (const type of preferredTypes) {
      const image = game.keyImages.find(img => img.type && img.type.toLowerCase() === type.toLowerCase());
      if (image && image.url) {
        return image.url;
      }
    }

    // Alternatif olarak, Steam oyunları için bazı özel alanları kontrol et
    if (game.distributionPlatform === 'steam') {
      // Steam ekran görüntülerini kontrol et
      if (game.screenshots && game.screenshots.length > 0) {
        return game.screenshots[0].url;
      }
      
      // Header image'i kontrol et
      if (game.headerImage) {
        return game.headerImage;
      }
    }

    // Bulunamadıysa ilk görüntüyü kullan
    return game.keyImages[0].url || '/placeholder.jpg';
  };

  // 10 saniyede bir öne çıkan oyunu değiştir
  useEffect(() => {
    if (featuredGames.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentFeaturedIndex(prevIndex => 
        prevIndex === featuredGames.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000);
    
    return () => clearInterval(interval);
  }, [featuredGames]);

  // Manuel olarak önceki öne çıkan oyuna geç
  const goToPrevFeatured = useCallback(() => {
    if (featuredGames.length <= 1) return;
    setCurrentFeaturedIndex(prevIndex => 
      prevIndex === 0 ? featuredGames.length - 1 : prevIndex - 1
    );
  }, [featuredGames]);

  // Manuel olarak sonraki öne çıkan oyuna geç
  const goToNextFeatured = useCallback(() => {
    if (featuredGames.length <= 1) return;
    setCurrentFeaturedIndex(prevIndex => 
      prevIndex === featuredGames.length - 1 ? 0 : prevIndex + 1
    );
  }, [featuredGames]);

  // Aktif platform için oyunları filtrele
  const getFilteredGames = () => {
    let games: ExtendedEpicGame[] = [];

    // İlk olarak sekme bazında oyunları seç
    if (activeTab === 'free') {
      games = [...freebieGames];
    } else if (activeTab === 'upcoming') {
      // Şimdilik hiç yakında çıkacak oyun göstermeyelim çünkü epic oyunları kaldırıldı
      games = [];
    } else if (activeTab === 'trending') {
      games = [...trendingGames];
    } else if (activeTab === 'loot') {
      games = [...freeLoots];
    } else if (activeTab === 'beta') {
      games = [...freeBetas];
    }

    // Null ve undefined oyunları temizle
    games = games.filter(game => game && game.title);

    // Sonra platform bazında filtrele
    if (activePlatform !== 'all') {
      return games.filter(game => {
        // Oyun null veya undefined ise filtrele
        if (!game) {
          return false;
        }

        const platform = game.distributionPlatform?.toLowerCase() || '';
        const platformName = game.platform?.toLowerCase() || '';
        
        switch (activePlatform) {
          case 'steam':
            return platform.includes('steam') || platformName.includes('steam');
          case 'playstation':
            return platformName.includes('playstation') || platformName.includes('ps4') || platformName.includes('ps5');
          case 'xbox':
            return platformName.includes('xbox');
          case 'switch':
            return platformName.includes('switch');
          case 'pc':
            return platformName.includes('pc') || platformName.includes('windows');
          case 'android':
            return platformName.includes('android');
          case 'ios':
            return platformName.includes('ios') || platformName.includes('apple');
          default:
            return true;
        }
      });
    }

    return games;
  };

  const filteredGames = getFilteredGames();

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "bg-green-600";
    if (score >= 70) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Platform card aktif durumu için stil sınıfları
  const getPlatformCardClass = (platform: string) => {
    return activePlatform === platform
      ? "bg-gradient-to-br from-purple-700 to-indigo-900 text-white border-2 border-purple-500"
      : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 hover:from-gray-700 hover:to-gray-800 border-2 border-transparent";
  };

  // Sekme aktif durumu için stil sınıfları
  const getTabClass = (tab: 'free' | 'upcoming' | 'trending' | 'loot' | 'beta') => {
    return activeTab === tab
      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      : "bg-gray-800 text-gray-300 hover:bg-gray-700";
  };

  // Kategori sayılarını göster
  const getCategoryCount = (tab: 'free' | 'upcoming' | 'trending' | 'loot' | 'beta') => {
    switch (tab) {
      case 'free':
        return freebieGames.length;
      case 'upcoming':
        return 0; // Epic API devre dışı olduğu için yakında çıkacak oyun yok
      case 'trending':
        return trendingGames.length;
      case 'loot':
        return freeLoots.length;
      case 'beta':
        return freeBetas.length;
      default:
        return 0;
    }
  };
  
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sort === "title") {
      return a.title.localeCompare(b.title);
    } else if (sort === "price") {
      const aPrice = a.price?.totalPrice?.discountPrice || 0;
      const bPrice = b.price?.totalPrice?.discountPrice || 0;
      return aPrice - bPrice;
    }
    return 0;
  });

  // YouTube video URL'sinden video ID'sini çıkarma
  const getYouTubeVideoId = (url: string): string => {
    if (!url) return '';
    
    // Youtube URL formatları:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    
    let videoId = '';
    
    // watch?v= formatını kontrol et
    if (url.includes('watch?v=')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } 
    // youtu.be/ formatını kontrol et
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    // embed/ formatını kontrol et
    else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    
    return videoId;
  };

  return (
    <>
      <Head>
        <title>FRPG Gaming - Ücretsiz Oyunları Keşfedin</title>
        <meta name="description" content="Tüm platformlardaki ücretsiz oyunları keşfedin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Hero Banner - Featured Games Slider */}
        {featuredGames.length > 0 && (
          <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-gray-900 z-10"></div>
            
            {/* Slider Görselleri ve YouTube Videoları */}
            {featuredGames.map((game, index) => (
              <div 
                key={`hero-${game.id}`} 
                className={`absolute inset-0 z-0 transition-all duration-1500 transform ${
                  index === currentFeaturedIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                {index === currentFeaturedIndex && game.videos && game.videos.length > 0 ? (
                  // YouTube video varsa göster
                  <div className="relative w-full h-full">
                    <iframe 
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(game.videos[0].url)}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${getYouTubeVideoId(game.videos[0].url)}&start=30`}
                      title={game.title || 'Featured Game'} 
                      width="100%" 
                      height="100%" 
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ pointerEvents: 'none' }}
                    ></iframe>
                    {/* Video üzerine ince ızgara deseni ekle */}
                    <div className="absolute inset-0 bg-[url('/patterns/grid-pattern.png')] opacity-20 mix-blend-multiply"></div>
                  </div>
                ) : (
                  // Video yoksa görseli göster
                  game.keyImages && game.keyImages.length > 0 && (
                    <>
                      <Image 
                        src={getBestGameImage(game)} 
                        alt={game.title || 'Featured Game'} 
                        fill 
                        style={{ objectFit: 'cover', objectPosition: 'center top' }}
                        priority={index === currentFeaturedIndex}
                        sizes="100vw"
                        quality={90}
                        className="transform hover:scale-105 transition-transform duration-10000 filter brightness-[0.85]"
                      />
                      {/* Görüntü üzerine ince ızgara deseni ekle */}
                      <div className="absolute inset-0 bg-[url('/patterns/grid-pattern.png')] opacity-20 mix-blend-multiply"></div>
                    </>
                  )
                )}
              </div>
            ))}
            
            {/* Slider İçeriği */}
            <div className="container mx-auto h-full flex flex-col justify-end pb-8 md:pb-16 relative z-20">
              {/* Platform Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-lg ${
                  featuredGames[currentFeaturedIndex]?.distributionPlatform === 'steam' 
                    ? 'bg-blue-600/80' 
                    : 'bg-purple-600/80'
                }`}>
                  {featuredGames[currentFeaturedIndex]?.distributionPlatform === 'steam' 
                    ? <><SiSteam className="mr-1" /> Steam</>
                    : featuredGames[currentFeaturedIndex]?.distributionPlatform === 'epic'
                      ? <><SiEpicgames className="mr-1" /> Epic Games</>
                      : featuredGames[currentFeaturedIndex]?.sourceLabel || 'Ücretsiz Oyun'
                  }
                </span>
              </div>
              
              {/* Oyun Başlığı */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-fade-in-right">
                {featuredGames[currentFeaturedIndex]?.title}
              </h1>
              
              {/* Oyun Açıklaması */}
              <p className="text-sm md:text-base lg:text-lg max-w-3xl mb-4 md:mb-6 text-gray-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] animate-fade-in-up backdrop-blur-[2px] bg-black/20 p-3 rounded-lg">
                {featuredGames[currentFeaturedIndex]?.description?.slice(0, 150)}
                {featuredGames[currentFeaturedIndex]?.description && 
                  featuredGames[currentFeaturedIndex]?.description.length > 150 ? '...' : ''}
              </p>
              
              {/* Butonlar */}
              <div className="flex flex-wrap gap-3 animate-fade-in-up">
                {featuredGames[currentFeaturedIndex]?.url && (
                  <Link 
                    href={featuredGames[currentFeaturedIndex].url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-xl transition-all transform hover:translate-y-[-2px] hover:shadow-2xl"
                    tabIndex={0}
                  >
                    <span>Görüntüle</span>
                    <FaExternalLinkAlt />
                  </Link>
                )}
                <Link
                  href="/games"
                  className="bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-xl transition-all transform hover:translate-y-[-2px] hover:shadow-2xl"
                  tabIndex={0}
                >
                  <span>Tüm Oyunlar</span>
                  <MdNavigateNext />
                </Link>
              </div>
              
              {/* Slider Kontrolleri */}
              {featuredGames.length > 1 && (
                <div className="flex justify-between items-center w-full absolute left-0 top-1/2 -translate-y-1/2 z-30 px-4">
                  <button 
                    onClick={goToPrevFeatured}
                    className="bg-black/40 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg"
                    aria-label="Önceki oyun"
                  >
                    <MdNavigateBefore className="text-3xl" />
                  </button>
                  <button 
                    onClick={goToNextFeatured}
                    className="bg-black/40 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg"
                    aria-label="Sonraki oyun"
                  >
                    <MdNavigateNext className="text-3xl" />
                  </button>
                </div>
              )}
              
              {/* İndikatörler */}
              {featuredGames.length > 1 && (
                <div className="flex justify-center gap-2 absolute bottom-4 left-0 right-0 z-30">
                  {featuredGames.map((_, index) => (
                    <button
                      key={`indicator-${index}`}
                      onClick={() => setCurrentFeaturedIndex(index)}
                      className={`transition-all duration-300 rounded-full shadow-md ${
                        index === currentFeaturedIndex 
                          ? 'w-12 h-3 bg-white/90' 
                          : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Oyun ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Platform Selection */}
        <section className="py-8 md:py-16 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 flex items-center gap-2">
              <FaGamepad />
              <span>Platformlar</span>
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4 mb-6 md:mb-10">
              <button
                className={`${getPlatformCardClass('all')} flex flex-col items-center justify-center py-2 md:py-3 px-1 md:px-2 rounded-lg transition-all shadow-md`}
                onClick={() => setActivePlatform('all')}
                tabIndex={0}
                aria-label="Tüm platformlar"
                onKeyDown={(e) => e.key === 'Enter' && setActivePlatform('all')}
              >
                <RiGamepadLine className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                <span className="text-xs sm:text-sm">Tümü</span>
              </button>

              {/* Epic Games Platformu geçici olarak devre dışı bırakıldı */}
              {/*
              <button
                className={`${getPlatformCardClass('epic')} flex flex-col items-center justify-center py-2 md:py-3 px-1 md:px-2 rounded-lg transition-all shadow-md`}
                onClick={() => setActivePlatform('epic')}
                tabIndex={0}
                aria-label="Epic Games platformu"
                onKeyDown={(e) => e.key === 'Enter' && setActivePlatform('epic')}
              >
                <SiEpicgames className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                <span className="text-xs sm:text-sm">Epic</span>
              </button>
              */}

              <button
                className={`${getPlatformCardClass('steam')} flex flex-col items-center justify-center py-2 md:py-3 px-1 md:px-2 rounded-lg transition-all shadow-md`}
                onClick={() => setActivePlatform('steam')}
                tabIndex={0}
                aria-label="Steam platformu"
                onKeyDown={(e) => e.key === 'Enter' && setActivePlatform('steam')}
              >
                <SiSteam className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                <span className="text-xs sm:text-sm">Steam</span>
              </button>

              <button
                className={`${getPlatformCardClass('pc')} flex flex-col items-center justify-center py-2 md:py-3 px-1 md:px-2 rounded-lg transition-all shadow-md`}
                onClick={() => setActivePlatform('pc')}
                tabIndex={0}
                aria-label="PC platformu"
                onKeyDown={(e) => e.key === 'Enter' && setActivePlatform('pc')}
              >
                <FaWindows className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                <span className="text-xs sm:text-sm">PC</span>
              </button>

              <button
                className={`${getPlatformCardClass('playstation')} flex flex-col items-center justify-center py-2 md:py-3 px-1 md:px-2 rounded-lg transition-all shadow-md`}
                onClick={() => setActivePlatform('playstation')}
                tabIndex={0}
                aria-label="PlayStation platformu"
                onKeyDown={(e) => e.key === 'Enter' && setActivePlatform('playstation')}
              >
                <FaPlaystation className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                <span className="text-xs sm:text-sm">PlayStation</span>
              </button>

              <button
                className={`${getPlatformCardClass('xbox')} flex flex-col items-center justify-center py-2 md:py-3 px-1 md:px-2 rounded-lg transition-all shadow-md`}
                onClick={() => setActivePlatform('xbox')}
                tabIndex={0}
                aria-label="Xbox platformu"
                onKeyDown={(e) => e.key === 'Enter' && setActivePlatform('xbox')}
              >
                <FaXbox className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                <span className="text-xs sm:text-sm">Xbox</span>
              </button>

              <button
                className={`${getPlatformCardClass('switch')} flex flex-col items-center justify-center py-2 md:py-3 px-1 md:px-2 rounded-lg transition-all shadow-md`}
                onClick={() => setActivePlatform('switch')}
                tabIndex={0}
                aria-label="Nintendo Switch platformu"
                onKeyDown={(e) => e.key === 'Enter' && setActivePlatform('switch')}
              >
                <SiNintendoswitch className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                <span className="text-xs sm:text-sm">Switch</span>
              </button>

              <button
                className={`${getPlatformCardClass('android')} flex flex-col items-center justify-center py-2 md:py-3 px-1 md:px-2 rounded-lg transition-all shadow-md`}
                onClick={() => setActivePlatform('android')}
                tabIndex={0}
                aria-label="Android platformu"
                onKeyDown={(e) => e.key === 'Enter' && setActivePlatform('android')}
              >
                <SiAndroid className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                <span className="text-xs sm:text-sm">Android</span>
              </button>

              <button
                className={`${getPlatformCardClass('ios')} flex flex-col items-center justify-center py-2 md:py-3 px-1 md:px-2 rounded-lg transition-all shadow-md`}
                onClick={() => setActivePlatform('ios')}
                tabIndex={0}
                aria-label="iOS platformu"
                onKeyDown={(e) => e.key === 'Enter' && setActivePlatform('ios')}
              >
                <SiApple className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                <span className="text-xs sm:text-sm">iOS</span>
              </button>
            </div>

            {/* Game Categories */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                className={`${getTabClass('free')} px-4 py-2 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 shadow-md`}
                onClick={() => setActiveTab('free')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveTab('free')}
              >
                <BiGift className="h-4 w-4" />
                <span>Ücretsiz Oyunlar</span>
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                  {getCategoryCount('free')}
                </span>
              </button>

              {/* Upcoming Epic Games sekmesi geçici olarak devre dışı bırakıldı */}
              {/*
              <button
                className={`${getTabClass('upcoming')} px-4 py-2 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 shadow-md`}
                onClick={() => setActiveTab('upcoming')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveTab('upcoming')}
              >
                <MdOutlineAccessTime className="h-4 w-4" />
                <span>Yakında</span>
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                  {getCategoryCount('upcoming')}
                </span>
              </button>
              */}

              <button
                className={`${getTabClass('trending')} px-4 py-2 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 shadow-md`}
                onClick={() => setActiveTab('trending')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveTab('trending')}
              >
                <FaFire className="h-4 w-4" />
                <span>Trend</span>
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                  {getCategoryCount('trending')}
                </span>
              </button>

              <button
                className={`${getTabClass('loot')} px-4 py-2 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 shadow-md`}
                onClick={() => setActiveTab('loot')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveTab('loot')}
              >
                <BsGift className="h-4 w-4" />
                <span>Loot</span>
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                  {getCategoryCount('loot')}
                </span>
              </button>

              <button
                className={`${getTabClass('beta')} px-4 py-2 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 shadow-md`}
                onClick={() => setActiveTab('beta')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveTab('beta')}
              >
                <RiTestTubeFill className="h-4 w-4" />
                <span>Beta</span>
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                  {getCategoryCount('beta')}
                </span>
              </button>
            </div>

            {/* Sorting Controls */}
            <div className="flex flex-wrap justify-between gap-3 mb-6">
              <div className="flex gap-2">
                <ToggleGroup type="single" value={sort} onValueChange={(value) => setSort(value as any)}>
                  <ToggleGroupItem 
                    value="none" 
                    aria-label="Varsayılan Sıralama" 
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSort("none")}
                  >
                    <span className="text-xs">Varsayılan</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="title" 
                    aria-label="İsme Göre Sırala" 
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSort("title")}
                  >
                    <span className="text-xs">İsme Göre</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="price" 
                    aria-label="Fiyata Göre Sırala" 
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSort("price")}
                  >
                    <span className="text-xs">Fiyata Göre</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {sortedGames.length > 0 ? (
                sortedGames.map((game) => (
                  <GameCard 
                    key={`${game.id}-${game.title}`} 
                    game={game} 
                    isFree={activeTab === 'free'} 
                    isUpcoming={activeTab === 'upcoming'} 
                    trending={activeTab === 'trending'}
                    isLoot={activeTab === 'loot'}
                    isBeta={activeTab === 'beta'}
                  />
                ))
              ) : (
                <div className="col-span-full py-8 sm:py-12 text-center">
                  <p className="text-lg sm:text-xl text-gray-400">Bu kategoride şu anda oyun bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Epic API çağrıları geçici olarak devre dışı bırakıldı
    // Tüm API çağrılarını paralel olarak yap
    const [
      // epicGames,
      // upcomingGames,
      gpOnlyGames,
      gpLoot,
      gpBeta,
      steamGames,
      // Epic API trendings devre dışı
      // trendingGames
      trendingGamerPowerGames
    ] = await Promise.all([
      // fetchFreeGames(),
      // fetchUpcomingFreeGames(),
      getGamerPowerOnlyGamesAsEpicFormat(),
      getGamerPowerLootAsEpicFormat(),
      getGamerPowerBetaAsEpicFormat(),
      getFreeSteamGames(),
      // fetchTrendingGames(),
      getTrendingGamerPowerGames()
    ]);

    // Boş veri durumunda hata olmasın diye boş dizi kullan ve düzgün serileştirme yap
    const safelySerialize = (data: any) => {
      try {
        // Önce JSON.stringify ile test et, düzgün serileştirme için
        JSON.stringify(data);
        return data;
      } catch (e) {
        console.error('Serileştirme hatası:', e);
        // Hataya neden olan undefined değerleri null olarak değiştir
        return JSON.parse(JSON.stringify(data, (key, value) => 
          value === undefined ? null : value
        ));
      }
    };

    // Epic oyunlarını temizle ve hazırla fonksiyonu şimdilik kullanılmıyor
    /*
    const sanitizeEpicGames = (games: any[]): ExtendedEpicGame[] => {
      return (games || []).map(game => ({
        ...game,
        source: 'epic',
        sourceLabel: 'Epic Games',
        distributionPlatform: 'epic'
      }));
    };
    */

    // Tüm oyunları bir araya getir - Epic oyunları dahil edilmedi
    const allGames = [
      // ...(epicGames || []), 
      ...(gpOnlyGames || []),
      ...(gpLoot || []), 
      ...(gpBeta || []),
      ...(steamGames || [])
    ];

    // Statik props olarak döndür
    return {
      props: {
        // Epic API oyunları geçici olarak devre dışı bırakıldı
        // epicFreeGames: safelySerialize(sanitizeEpicGames(epicGames || [])),
        // upcomingEpicGames: safelySerialize(sanitizeEpicGames(upcomingGames || [])),
        freebieGames: safelySerialize(gpOnlyGames || []),
        freeLoots: safelySerialize(gpLoot || []),
        freeBetas: safelySerialize(gpBeta || []),
        steamFreeGames: safelySerialize(steamGames || []),
        // trendingGames: safelySerialize(trendingGames || []),
        trendingGames: safelySerialize(trendingGamerPowerGames || []),
        totalGames: allGames.length,
      },
      // Her 6 saatte bir yeniden oluştur
      revalidate: 21600
    };
  } catch (error) {
    console.error('getStaticProps error:', error);
    
    // Hata durumunda boş verilerle devam et
    return {
      props: {
        // Epic API oyunları geçici olarak kaldırıldı
        // epicFreeGames: [],
        // upcomingEpicGames: [],
        freebieGames: [],
        freeLoots: [],
        freeBetas: [],
        steamFreeGames: [],
        trendingGames: [],
        totalGames: 0,
      },
      // Hata durumunda daha sık yenileme dene
      revalidate: 3600
    };
  }
} 