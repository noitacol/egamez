import { GetStaticProps } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { fetchFreeGames, fetchUpcomingFreeGames, fetchTrendingGames } from "@/lib/epic-api";
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
import { SiEpicgames, SiSteam, SiNintendoswitch, SiGogdotcom } from "react-icons/si";
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
  epicFreeGames: ExtendedEpicGame[];
  upcomingEpicGames: ExtendedEpicGame[];
  freebieGames: ExtendedEpicGame[];
  freeLoots: ExtendedEpicGame[];
  freeBetas: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  trendingGames: ExtendedEpicGame[];
  totalGames: number;
}

export default function Home({ 
  epicFreeGames, 
  upcomingEpicGames, 
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
  const [activePlatform, setActivePlatform] = useState<'all' | 'epic' | 'playstation' | 'xbox' | 'switch' | 'pc' | 'mobile'>('all');
  const [filter, setFilter] = useState<"all" | "epic" | "steam">("all");
  const [sort, setSort] = useState<"none" | "title" | "price">("none");

  // Ana ekranda gösterilecek öne çıkan oyunu belirle
  useEffect(() => {
    if (trendingGames && trendingGames.length > 0) {
      setFeaturedGame(trendingGames[0]);
    } else if (epicFreeGames && epicFreeGames.length > 0) {
      setFeaturedGame(epicFreeGames[0]);
    }
  }, [trendingGames, epicFreeGames]);

  // Aktif platform için oyunları filtrele
  const getFilteredGames = () => {
    let games: ExtendedEpicGame[] = [];

    // İlk olarak sekme bazında oyunları seç
    if (activeTab === 'free') {
      games = [...epicFreeGames, ...freebieGames];
    } else if (activeTab === 'upcoming') {
      games = [...upcomingEpicGames];
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
          case 'epic':
            return platform.includes('epic') || platformName.includes('epic');
          case 'playstation':
            return platformName.includes('playstation') || platformName.includes('ps4') || platformName.includes('ps5');
          case 'xbox':
            return platformName.includes('xbox');
          case 'switch':
            return platformName.includes('switch');
          case 'pc':
            return platformName.includes('pc') || platformName.includes('windows');
          case 'mobile':
            return platformName.includes('android') || platformName.includes('ios') || platformName.includes('mobile');
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
        return epicFreeGames.length + freebieGames.length;
      case 'upcoming':
        return upcomingEpicGames.length;
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

  const combinedFreeGames = [...epicFreeGames, ...freebieGames];
  
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
        <meta name="description" content="Epic Games ve tüm platformlardaki ücretsiz oyunları keşfedin" />
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
                  className="object-cover opacity-50"
                  priority
                  unoptimized={true}
                />
              )}
            </div>
            <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-20 relative z-20">
              <h1 className="text-4xl md:text-6xl font-bold mb-2 text-white">
                {featuredGame.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-2xl">
                Ücretsiz oyunlar ve içerikler burada! Hemen indirip oynamaya başlayın.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="#games" aria-label="Oyunlara Git" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}>
                    Oyunları Keşfet
                  </Link>
                </Button>
                
                {featuredGame.url && (
                  <Button asChild variant="outline" size="lg">
                    <Link href={featuredGame.url} target="_blank" aria-label="Talep Et" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}>
                      <FaExternalLinkAlt className="mr-2 h-4 w-4" />
                      Talep Et
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Platform Selection */}
        <section className="py-8 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Platformlar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <button
                onClick={() => setActivePlatform('all')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${getPlatformCardClass('all')}`}
                aria-label="Tüm Platformlar"
                tabIndex={0}
              >
                <RiGamepadLine className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Tümü</span>
              </button>
              
              <button
                onClick={() => setActivePlatform('epic')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${getPlatformCardClass('epic')}`}
                aria-label="Epic Games"
                tabIndex={0}
              >
                <SiEpicgames className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Epic</span>
              </button>
              
              <button
                onClick={() => setActivePlatform('pc')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${getPlatformCardClass('pc')}`}
                aria-label="PC Oyunları"
                tabIndex={0}
              >
                <FaWindows className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">PC</span>
              </button>
              
              <button
                onClick={() => setActivePlatform('playstation')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${getPlatformCardClass('playstation')}`}
                aria-label="PlayStation Oyunları"
                tabIndex={0}
              >
                <FaPlaystation className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">PlayStation</span>
              </button>
              
              <button
                onClick={() => setActivePlatform('xbox')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${getPlatformCardClass('xbox')}`}
                aria-label="Xbox Oyunları"
                tabIndex={0}
              >
                <FaXbox className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Xbox</span>
              </button>
              
              <button
                onClick={() => setActivePlatform('switch')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${getPlatformCardClass('switch')}`}
                aria-label="Nintendo Switch Oyunları"
                tabIndex={0}
              >
                <SiNintendoswitch className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Switch</span>
              </button>
              
              <button
                onClick={() => setActivePlatform('mobile')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${getPlatformCardClass('mobile')}`}
                aria-label="Mobil Oyunlar"
                tabIndex={0}
              >
                <SiGogdotcom className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Mobil</span>
              </button>
            </div>
          </div>
        </section>

        {/* Game Categories */}
        <section id="games" className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Ücretsiz Oyunlar</h2>
              <div className="text-sm text-gray-400">
                Toplam: {totalGames} oyun bulundu
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveTab('free')}
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition ${getTabClass('free')}`}
                aria-label="Ücretsiz Oyunlar"
                tabIndex={0}
              >
                <BsGift className="h-4 w-4" />
                <span>Ücretsiz</span>
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                  {getCategoryCount('free')}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition ${getTabClass('upcoming')}`}
                aria-label="Yakında Ücretsiz Olacak"
                tabIndex={0}
              >
                <MdOutlineAccessTime className="h-4 w-4" />
                <span>Yakında</span>
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                  {getCategoryCount('upcoming')}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('trending')}
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition ${getTabClass('trending')}`}
                aria-label="Trend Oyunlar"
                tabIndex={0}
              >
                <FaFire className="h-4 w-4" />
                <span>Trend</span>
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                  {getCategoryCount('trending')}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('loot')}
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition ${getTabClass('loot')}`}
                aria-label="Oyun İçi Öğeler"
                tabIndex={0}
              >
                <BiGift className="h-4 w-4" />
                <span>Oyun İçi</span>
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                  {getCategoryCount('loot')}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('beta')}
                className={`flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium transition ${getTabClass('beta')}`}
                aria-label="Beta Sürümler"
                tabIndex={0}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                <div className="col-span-full py-12 text-center">
                  <p className="text-xl text-gray-400">Bu kategoride şu anda oyun bulunmuyor.</p>
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
    // Tüm API çağrılarını paralel olarak yap
    const [
      epicGames,
      upcomingGames,
      gpOnlyGames,
      gpLoot,
      gpBeta,
      steamGames,
      trendingGames
    ] = await Promise.all([
      fetchFreeGames(),
      fetchUpcomingFreeGames(),
      getGamerPowerOnlyGamesAsEpicFormat(),
      getGamerPowerLootAsEpicFormat(),
      getGamerPowerBetaAsEpicFormat(),
      getFreeSteamGames(),
      fetchTrendingGames(),
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

    // Epic oyunlarını temizle ve hazırla
    const sanitizeEpicGames = (games: any[]): ExtendedEpicGame[] => {
      return (games || []).map(game => ({
        ...game,
        source: 'epic',
        sourceLabel: 'Epic Games',
        distributionPlatform: 'epic'
      }));
    };

    // Tüm oyunları bir araya getir ve tüm verileri düzgün serileştir 
    const allGames = [
      ...(epicGames || []), 
      ...(gpOnlyGames || []),
      ...(gpLoot || []), 
      ...(gpBeta || []),
      ...(steamGames || [])
    ];

    // Statik props olarak döndür
    return {
      props: {
        epicFreeGames: safelySerialize(sanitizeEpicGames(epicGames || [])),
        upcomingEpicGames: safelySerialize(sanitizeEpicGames(upcomingGames || [])),
        freebieGames: safelySerialize(gpOnlyGames || []),
        freeLoots: safelySerialize(gpLoot || []),
        freeBetas: safelySerialize(gpBeta || []),
        steamFreeGames: safelySerialize(steamGames || []),
        trendingGames: safelySerialize(trendingGames || []),
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
        epicFreeGames: [],
        upcomingEpicGames: [],
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