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
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { BsGift } from "react-icons/bs";
import { RiTestTubeFill } from "react-icons/ri";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface HomeProps {
  epicFreeGames: ExtendedEpicGame[];
  upcomingEpicGames: ExtendedEpicGame[];
  gamerPowerGames: ExtendedEpicGame[];
  gamerPowerLoot: ExtendedEpicGame[];
  gamerPowerBeta: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  trendingGames: ExtendedEpicGame[];
  totalGames: number;
}

export default function Home({ 
  epicFreeGames, 
  upcomingEpicGames, 
  gamerPowerGames,
  gamerPowerLoot,
  gamerPowerBeta,
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
      games = [...epicFreeGames, ...gamerPowerGames];
    } else if (activeTab === 'upcoming') {
      games = [...upcomingEpicGames];
    } else if (activeTab === 'trending') {
      games = [...trendingGames];
    } else if (activeTab === 'loot') {
      games = [...gamerPowerLoot];
    } else if (activeTab === 'beta') {
      games = [...gamerPowerBeta];
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
        return epicFreeGames.length + gamerPowerGames.length;
      case 'upcoming':
        return upcomingEpicGames.length;
      case 'trending':
        return trendingGames.length;
      case 'loot':
        return gamerPowerLoot.length;
      case 'beta':
        return gamerPowerBeta.length;
      default:
        return 0;
    }
  };

  const combinedFreeGames = [...epicFreeGames, ...gamerPowerGames];
  
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
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{featuredGame.title}</h1>
                {featuredGame.seller && (
                  <p className="text-gray-300 mb-2">{featuredGame.seller.name}</p>
                )}
                {featuredGame.metacritic && (
                  <div className="flex items-center mb-4">
                    <span className={`${getScoreBadgeColor(featuredGame.metacritic.score)} text-white px-2 py-1 text-sm font-bold rounded`}>
                      {featuredGame.metacritic.score}
                    </span>
                    <span className="ml-2 text-sm text-gray-300">Metacritic</span>
                  </div>
                )}
                <p className="text-gray-200 text-lg mb-6 line-clamp-2">{featuredGame.description}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/game/${featuredGame.id}`} className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-full font-medium transition duration-300">
                    Detaylar
                  </Link>
                  {featuredGame.url && (
                    <a href={featuredGame.url} target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-full font-medium transition duration-300 flex items-center">
                      <span>Mağazada Görüntüle</span>
                      <FaExternalLinkAlt className="ml-2 h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Kategori Sekmeleri */}
        <section className="container mx-auto px-4 mt-8 mb-4">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveTab('free')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${getTabClass('free')}`}
            >
              <FaGamepad className="mr-2" /> 
              Ücretsiz Oyunlar 
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                {getCategoryCount('free')}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('upcoming')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${getTabClass('upcoming')}`}
            >
              <FaChevronRight className="mr-2" /> 
              Yakında Ücretsiz 
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                {getCategoryCount('upcoming')}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('trending')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${getTabClass('trending')}`}
            >
              <FaFire className="mr-2" /> 
              Trend Oyunlar 
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                {getCategoryCount('trending')}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('loot')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${getTabClass('loot')}`}
            >
              <BsGift className="mr-2" /> 
              Loot & DLC 
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                {getCategoryCount('loot')}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('beta')} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${getTabClass('beta')}`}
            >
              <RiTestTubeFill className="mr-2" /> 
              Beta Testler 
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                {getCategoryCount('beta')}
              </span>
            </button>
          </div>
        </section>

        {/* Platform Selection */}
        <section className="pt-4 pb-6 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Platformlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            <button 
              onClick={() => setActivePlatform('all')}
              className={`flex flex-col items-center justify-center rounded-lg p-4 transition duration-300 ${getPlatformCardClass('all')}`}
            >
              <RiGamepadLine className="h-8 w-8 mb-2" />
              <span className="text-xs font-medium">Tümü</span>
            </button>
            <button 
              onClick={() => setActivePlatform('epic')}
              className={`flex flex-col items-center justify-center rounded-lg p-4 transition duration-300 ${getPlatformCardClass('epic')}`}
            >
              <SiEpicgames className="h-8 w-8 mb-2" />
              <span className="text-xs font-medium">Epic Games</span>
            </button>
            <button 
              onClick={() => setActivePlatform('playstation')}
              className={`flex flex-col items-center justify-center rounded-lg p-4 transition duration-300 ${getPlatformCardClass('playstation')}`}
            >
              <FaPlaystation className="h-8 w-8 mb-2" />
              <span className="text-xs font-medium">PlayStation</span>
            </button>
            <button 
              onClick={() => setActivePlatform('xbox')}
              className={`flex flex-col items-center justify-center rounded-lg p-4 transition duration-300 ${getPlatformCardClass('xbox')}`}
            >
              <FaXbox className="h-8 w-8 mb-2" />
              <span className="text-xs font-medium">Xbox</span>
            </button>
            <button 
              onClick={() => setActivePlatform('switch')}
              className={`flex flex-col items-center justify-center rounded-lg p-4 transition duration-300 ${getPlatformCardClass('switch')}`}
            >
              <SiNintendoswitch className="h-8 w-8 mb-2" />
              <span className="text-xs font-medium">Switch</span>
            </button>
            <button 
              onClick={() => setActivePlatform('pc')}
              className={`flex flex-col items-center justify-center rounded-lg p-4 transition duration-300 ${getPlatformCardClass('pc')}`}
            >
              <FaWindows className="h-8 w-8 mb-2" />
              <span className="text-xs font-medium">PC</span>
            </button>
            <button 
              onClick={() => setActivePlatform('mobile')}
              className={`flex flex-col items-center justify-center rounded-lg p-4 transition duration-300 ${getPlatformCardClass('mobile')}`}
            >
              <SiGogdotcom className="h-8 w-8 mb-2" />
              <span className="text-xs font-medium">Mobile</span>
            </button>
          </div>
        </section>

        {/* Oyun Listesi */}
        <section className="py-6 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            {activeTab === 'free' && "Ücretsiz Oyunlar"}
            {activeTab === 'upcoming' && "Yakında Ücretsiz Olacak"}
            {activeTab === 'trending' && "Trend Oyunlar"}
            {activeTab === 'loot' && "Loot ve DLC İçerikleri"}
            {activeTab === 'beta' && "Beta Test Oyunları"}
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (() => {
            if (activeTab === 'free') {
              return (
                <FreeGamesList 
                  epicGames={epicFreeGames} 
                  steamGames={steamFreeGames} 
                  gamerPowerGames={gamerPowerGames} 
                />
              );
            } else if (filteredGames.length > 0) {
              const tab = activeTab as any;
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {sortedGames.map((game) => {
                    // Tip hatalarını önleyen bir yaklaşım
                    switch (tab) {
                      case 'free':
                        return <GameCard key={game.id} game={game} isFree={true} />;
                      case 'upcoming':
                        return <GameCard key={game.id} game={game} isUpcoming={true} />;
                      case 'trending':
                        return <GameCard key={game.id} game={game} trending={true} />;
                      case 'loot':
                        return <GameCard key={game.id} game={game} isLoot={true} />;
                      case 'beta':
                        return <GameCard key={game.id} game={game} isBeta={true} />;
                      default:
                        return <GameCard key={game.id} game={game} />;
                    }
                  })}
                </div>
              );
            } else {
              return (
                <div className="text-center py-12 bg-gray-800 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Oyun Bulunamadı</h3>
                  <p className="text-gray-400">Seçilen filtrelerle eşleşen oyun bulunamadı.</p>
                </div>
              );
            }
          })()}
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Epic Games API'sinden ücretsiz ve yakında ücretsiz olacak oyunları al
    let epicFreeGames = await fetchFreeGames();
    let upcomingEpicGames = await fetchUpcomingFreeGames();
    
    // GamerPower API'sinden çeşitli içerikleri al
    let gamerPowerGames = await getGamerPowerOnlyGamesAsEpicFormat(); // Sadece 'game' tipindeki oyunlar
    let gamerPowerLoot = await getGamerPowerLootAsEpicFormat();
    let gamerPowerBeta = await getGamerPowerBetaAsEpicFormat();
    
    // Steam API'sinden ücretsiz oyunları al
    let steamFreeGames = await getFreeSteamGames();
    
    // Trend oyunlar için
    const trendingGamerPowerGames = await getTrendingGamerPowerGames();
    const trendingEpicGames = await fetchTrendingGames();
    const trendingSteamGames = await getTrendingSteamGames();
    
    // Tüm trend oyunları birleştir
    let allTrendingGames = [...trendingEpicGames, ...trendingGamerPowerGames, ...trendingSteamGames].slice(0, 12);
    
    // Serileştirme hatalarını önlemek için veriyi temizleyelim
    const safelySerialize = (data: any) => {
      return JSON.parse(JSON.stringify(data || []));
    };
    
    // Verileri temizle
    epicFreeGames = safelySerialize(epicFreeGames);
    upcomingEpicGames = safelySerialize(upcomingEpicGames);
    gamerPowerGames = safelySerialize(gamerPowerGames);
    gamerPowerLoot = safelySerialize(gamerPowerLoot);
    gamerPowerBeta = safelySerialize(gamerPowerBeta);
    steamFreeGames = safelySerialize(steamFreeGames);
    allTrendingGames = safelySerialize(allTrendingGames);
    
    // Oyun verilerini kontrol et ve eksik alanları tamamla
    const sanitizeEpicGames = (games: any[]): ExtendedEpicGame[] => {
      return games.map(game => {
        // Başlık kontrolü
        let title = game.title || game.name || 'İsimsiz Oyun';
        if (typeof title !== 'string' || title.trim() === '') {
          title = 'İsimsiz Oyun';
        }
        
        // Resim kontrolü
        let keyImages = game.keyImages || [];
        if (!Array.isArray(keyImages) || keyImages.length === 0) {
          // Eğer headerImage varsa, bunu keyImages'a ekle
          if (game.headerImage || game.header_image) {
            keyImages = [{
              type: 'OfferImageWide',
              url: game.headerImage || game.header_image
            }];
          }
        }
        
        return {
          ...game,
          title,
          id: game.id || `game-${Math.random().toString(36).substr(2, 9)}`,
          effectiveDate: game.effectiveDate || new Date().toISOString(),
          categories: game.categories || [],
          keyImages,
          headerImage: game.headerImage || game.header_image || (keyImages.length > 0 ? keyImages[0].url : ''),
          description: game.description || 'Bu oyun hakkında açıklama bulunmamaktadır.',
          price: game.price || {
            totalPrice: {
              originalPrice: 0,
              discountPrice: 0,
              discount: 0
            }
          }
        }
      }) as ExtendedEpicGame[];
    };
    
    // Tüm oyun listelerini temizle ve type dönüşümlerini gerçekleştir
    const epicGames = sanitizeEpicGames(epicFreeGames);
    const upcomingGames = sanitizeEpicGames(upcomingEpicGames);
    const gpGames = sanitizeEpicGames(gamerPowerGames);
    const gpLoot = sanitizeEpicGames(gamerPowerLoot);
    const gpBeta = sanitizeEpicGames(gamerPowerBeta);
    const steamGames = sanitizeEpicGames(steamFreeGames);
    const trendingGames = sanitizeEpicGames(allTrendingGames);
    
    const totalGames = epicGames.length + upcomingGames.length + gpGames.length + gpLoot.length + gpBeta.length + steamGames.length;

    return {
      props: {
        epicFreeGames: epicGames,
        upcomingEpicGames: upcomingGames,
        gamerPowerGames: gpGames,
        gamerPowerLoot: gpLoot,
        gamerPowerBeta: gpBeta,
        steamFreeGames: steamGames,
        trendingGames: trendingGames,
        totalGames
      },
      // Her 6 saatte bir yeniden oluştur
      revalidate: 21600,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        epicFreeGames: [] as ExtendedEpicGame[],
        upcomingEpicGames: [] as ExtendedEpicGame[],
        gamerPowerGames: [] as ExtendedEpicGame[],
        gamerPowerLoot: [] as ExtendedEpicGame[],
        gamerPowerBeta: [] as ExtendedEpicGame[],
        steamFreeGames: [] as ExtendedEpicGame[],
        trendingGames: [] as ExtendedEpicGame[],
        totalGames: 0
      },
      // Hata durumunda 1 saat sonra yeniden dene
      revalidate: 3600,
    };
  }
}; 