import { GetStaticProps } from "next";
import { useState, useEffect } from "react";
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
  const [featuredGame, setFeaturedGame] = useState<ExtendedEpicGame | null>(null);
  const [activePlatform, setActivePlatform] = useState<'all' | 'steam' | 'playstation' | 'xbox' | 'switch' | 'pc' | 'android' | 'ios'>('all');
  const [filter, setFilter] = useState<"all" | "steam">("all");
  const [sort, setSort] = useState<"none" | "title" | "price">("none");

  // Ana ekranda gösterilecek öne çıkan oyunu belirle
  useEffect(() => {
    if (trendingGames && trendingGames.length > 0) {
      setFeaturedGame(trendingGames[0]);
    } else if (freebieGames && freebieGames.length > 0) {
      setFeaturedGame(freebieGames[0]);
    }
  }, [trendingGames, freebieGames]);

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

  return (
    <>
      <Head>
        <title>FRPG Gaming - Ücretsiz Oyunları Keşfedin</title>
        <meta name="description" content="Tüm platformlardaki ücretsiz oyunları keşfedin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Hero Banner - Featured Game */}
        {featuredGame && (
          <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-10"></div>
            <div className="absolute inset-0 z-0">
              {featuredGame.keyImages && featuredGame.keyImages.length > 0 && (
                <Image 
                  src={featuredGame.keyImages[0].url || '/placeholder.jpg'} 
                  alt={featuredGame.title || 'Featured Game'} 
                  fill 
                  style={{ objectFit: 'cover' }}
                  priority
                />
              )}
            </div>

            <div className="container mx-auto h-full flex flex-col justify-end pb-8 md:pb-16 relative z-20">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 text-shadow-lg">{featuredGame.title}</h1>
              <p className="text-sm md:text-base lg:text-lg max-w-3xl mb-4 md:mb-6 text-shadow-md">
                {featuredGame.description?.slice(0, 150)}
                {featuredGame.description && featuredGame.description.length > 150 ? '...' : ''}
              </p>
              <div className="flex flex-wrap gap-3">
                {featuredGame.url && (
                  <Link 
                    href={featuredGame.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all"
                    tabIndex={0}
                  >
                    <span>Görüntüle</span>
                    <FaExternalLinkAlt />
                  </Link>
                )}
                <Link
                  href="/games"
                  className="bg-gray-800 hover:bg-gray-700 px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all"
                  tabIndex={0}
                >
                  <span>Tüm Oyunlar</span>
                  <MdNavigateNext />
                </Link>
              </div>
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