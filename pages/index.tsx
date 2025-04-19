import { GetStaticProps } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { getFreeGames, getUpcomingFreeGames, getTrendingEpicGames } from "@/lib/epic-api";
import { getFreeSteamGames, getTrendingSteamGames } from "@/lib/steam-api";
import { getFreeGamerPowerGames, getTrendingGamerPowerGames } from "@/lib/gamerpower-api";
import FreeGamesList from "@/components/FreeGamesList";
import GameCard from "@/components/GameCard";
import { ExtendedEpicGame } from "@/lib/types";
import { SiEpicgames, SiSteam, SiNintendoswitch, SiGogdotcom } from "react-icons/si";
import { FaPlaystation, FaXbox, FaWindows, FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from "react-icons/fa";
import { RiGamepadLine } from "react-icons/ri";
import { GiRaceCar, GiSwordman, GiSpellBook, GiMountainRoad, GiChessKnight } from "react-icons/gi";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";

interface HomeProps {
  epicFreeGames: ExtendedEpicGame[];
  upcomingEpicGames: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  gamerPowerGames: ExtendedEpicGame[];
  trendingGames: ExtendedEpicGame[];
  totalGames: number;
}

export default function Home({ 
  epicFreeGames, 
  upcomingEpicGames, 
  steamFreeGames,
  gamerPowerGames,
  trendingGames,
  totalGames 
}: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'free' | 'upcoming' | 'trending'>('free');
  const [featuredGame, setFeaturedGame] = useState<ExtendedEpicGame | null>(null);
  const [activePlatform, setActivePlatform] = useState<'all' | 'epic' | 'steam' | 'playstation' | 'xbox' | 'switch' | 'pc' | 'mobile'>('all');

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
      games = [...epicFreeGames, ...steamFreeGames, ...gamerPowerGames];
    } else if (activeTab === 'upcoming') {
      games = [...upcomingEpicGames];
    } else if (activeTab === 'trending') {
      games = [...trendingGames];
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

  return (
    <>
      <Head>
        <title>FRPG Gaming - Ücretsiz Oyunları Keşfedin</title>
        <meta name="description" content="Epic Games, Steam ve tüm platformlardaki ücretsiz oyunları keşfedin" />
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

        {/* Platform Selection */}
        <section className="pt-10 pb-6 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Platformlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            <button 
              onClick={() => setActivePlatform('all')}
              className={`flex flex-col items-center justify-center rounded-lg p-4 transition duration-300 ${getPlatformCardClass('all')}`}
            >
              <RiGamepadLine className="h-8 w-8 mb-2" />
              <span className="text-xs font-medium">Tümü</span>
            </button>
            <button 
              onClick={() => setActivePlatform('steam')}
              className={`flex flex-col items-center justify-center rounded-lg p-4 transition duration-300 ${getPlatformCardClass('steam')}`}
            >
              <SiSteam className="h-8 w-8 mb-2" />
              <span className="text-xs font-medium">Steam</span>
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

        {/* Trend Oyunlar */}
        <section className="py-10 container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Trend Oyunlar</h2>
            <div className="flex space-x-2">
              <button className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full">
                <FaChevronLeft className="h-5 w-5" />
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full">
                <FaChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {trendingGames.slice(0, 5).map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isTrending
              />
            ))}
          </div>
        </section>

        {/* Tab butonları */}
        <section className="container mx-auto px-4 py-8">
          <div className="border-b border-gray-700 mb-8">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('free')}
                className={`py-3 px-4 font-medium text-sm relative ${
                  activeTab === 'free'
                    ? 'text-white before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-red-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Ücretsiz Oyunlar
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-3 px-4 font-medium text-sm relative ${
                  activeTab === 'upcoming'
                    ? 'text-white before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-red-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Yakında Ücretsiz
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`py-3 px-4 font-medium text-sm relative ${
                  activeTab === 'trending'
                    ? 'text-white before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-red-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Trend Oyunlar
              </button>
            </div>
          </div>
          
          {/* Filtrelenmiş oyunlar */}
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-900/30 border border-red-800 p-4 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-lg text-center">
                <RiGamepadLine className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">Seçilen kriterlere uygun oyun bulunamadı.</p>
                <button 
                  onClick={() => {
                    setActivePlatform('all');
                    setActiveTab('free');
                  }}
                  className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-md font-medium text-sm transition duration-300"
                >
                  Tüm oyunları göster
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredGames.map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game}
                    isUpcoming={activeTab === 'upcoming' || game.isUpcoming}
                    isFree={activeTab === 'free' || game.isFree}
                    isTrending={activeTab === 'trending' || game.isTrending}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Yaklaşan İndirimler */}
        <section className="py-10 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 md:col-span-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Yaklaşan İndirimler</h2>
              <p className="text-gray-400 mb-6">Kaçırılmayacak oyun indirimleri için takipte kalın.</p>
              <div className="space-y-4">
                {[
                  { platform: 'Steam Yaz İndirimleri', date: '15 Haziran 2023', logo: SiSteam },
                  { platform: 'Epic Mega İndirimler', date: '20 Haziran 2023', logo: SiEpicgames },
                  { platform: 'PlayStation Days of Play', date: '1 Haziran 2023', logo: FaPlaystation },
                  { platform: 'Xbox Ultimate Game Sale', date: '10 Temmuz 2023', logo: FaXbox }
                ].map((item, index) => {
                  const Logo = item.logo;
                  return (
                    <div key={index} className="flex items-center bg-gray-800/50 p-3 rounded-lg">
                      <div className="bg-gray-700 p-2 rounded-lg mr-3">
                        <Logo className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.platform}</p>
                        <p className="text-gray-400 text-xs">{item.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-span-1 md:col-span-3">
              <h2 className="text-xl font-bold mb-4">En Popüler Oyunlar</h2>
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4" style={{ minWidth: 'min-content' }}>
                  {trendingGames.slice(0, 6).map((game) => (
                    <div key={game.id} className="w-56 flex-shrink-0">
                      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                        <div className="h-32 relative">
                          {game.keyImages && game.keyImages.length > 0 ? (
                            <Image 
                              src={game.keyImages[0].url || '/placeholder.jpg'} 
                              alt={game.title || 'Game cover'} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <RiGamepadLine className="h-10 w-10 text-gray-500" />
                            </div>
                          )}
                          {game.metacritic && (
                            <div className="absolute bottom-2 right-2 bg-black/70 rounded px-1.5 py-0.5 text-xs font-bold">
                              {game.metacritic.score}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm line-clamp-1">{game.title}</h3>
                          {game.price && (
                            <div className="mt-2 flex flex-col">
                              <div className="flex items-center gap-2">
                                {game.price.totalPrice && game.price.totalPrice.discount > 0 && (
                                  <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white">
                                    -{game.price.totalPrice.discount}%
                                  </span>
                                )}
                                <div className="flex items-center gap-1.5">
                                  {game.price.totalPrice && game.price.totalPrice.discount > 0 && (
                                    <span className="text-sm text-muted-foreground line-through">
                                      {new Intl.NumberFormat("tr-TR", {
                                        style: "currency",
                                        currency: "TRY",
                                      }).format(game.price.totalPrice.originalPrice || 0)}
                                    </span>
                                  )}
                                  <span className="text-sm font-medium">
                                    {game.price.totalPrice ? 
                                      new Intl.NumberFormat("tr-TR", {
                                        style: "currency",
                                        currency: "TRY",
                                      }).format(game.price.totalPrice.discountPrice || 0)
                                      : 'Belirtilmemiş'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Oyun Kategorileri */}
        <section className="py-10 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Oyun Kategorileri</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: 'Spor & Yarış', icon: GiRaceCar, color: 'from-blue-600 to-blue-800' },
              { name: 'RPG', icon: GiSwordman, color: 'from-purple-600 to-purple-800' },
              { name: 'Aksiyon', icon: GiChessKnight, color: 'from-red-600 to-red-800' },
              { name: 'Macera', icon: GiMountainRoad, color: 'from-green-600 to-green-800' },
              { name: 'Strateji', icon: GiSpellBook, color: 'from-yellow-600 to-yellow-800' },
            ].map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className={`bg-gradient-to-r ${category.color} rounded-lg p-6 flex flex-col items-center cursor-pointer transition-transform duration-300 transform hover:scale-105`}>
                  <Icon className="h-12 w-12 mb-4" />
                  <h3 className="font-medium text-center">{category.name}</h3>
                  <span className="mt-2 text-xs text-white/70">16 Oyun</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Son Eklenenler */}
        <section className="py-10 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Son Eklenenler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {epicFreeGames.slice(0, 4).map((game) => (
              <div key={game.id} className="bg-gray-800 rounded-lg overflow-hidden group hover:bg-gray-700 transition-colors duration-300">
                <Link href={`/game/${game.id}`}>
                  <div className="h-40 relative overflow-hidden">
                    {game.keyImages && game.keyImages.length > 0 ? (
                      <Image 
                        src={game.keyImages[0].url || '/placeholder.jpg'} 
                        alt={game.title || 'Game cover'} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <RiGamepadLine className="h-10 w-10 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                      <h3 className="font-medium text-sm">{game.title}</h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Epic Games API'sinden ücretsiz ve yakında ücretsiz olacak oyunları al
    let epicFreeGames = await getFreeGames();
    let upcomingEpicGames = await getUpcomingFreeGames();
    
    // Steam API'sinden ücretsiz ve trend olan oyunları al
    let steamFreeGames = await getFreeSteamGames();
    const trendingSteamGames = await getTrendingSteamGames();
    
    // GamerPower API'sinden ücretsiz ve trend olan oyunları al
    let gamerPowerFreeGames = await getFreeGamerPowerGames();
    const trendingGamerPowerGames = await getTrendingGamerPowerGames();
    
    // Tüm trend oyunları birleştir
    let allTrendingGames = [...trendingSteamGames, ...trendingGamerPowerGames].slice(0, 12);
    
    // Serileştirme hatalarını önlemek için veriyi temizleyelim
    const safelySerialize = (data: any) => {
      return JSON.parse(JSON.stringify(data || []));
    };
    
    // Verileri temizle
    epicFreeGames = safelySerialize(epicFreeGames);
    upcomingEpicGames = safelySerialize(upcomingEpicGames);
    steamFreeGames = safelySerialize(steamFreeGames);
    gamerPowerFreeGames = safelySerialize(gamerPowerFreeGames);
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
    const steamGames = sanitizeEpicGames(steamFreeGames);
    const gamerPowerGames = sanitizeEpicGames(gamerPowerFreeGames);
    const trendingGames = sanitizeEpicGames(allTrendingGames);
    
    const totalGames = epicGames.length + upcomingGames.length + steamGames.length + gamerPowerGames.length + trendingGames.length;

    return {
      props: {
        epicFreeGames: epicGames,
        upcomingEpicGames: upcomingGames,
        steamFreeGames: steamGames,
        gamerPowerGames: gamerPowerGames,
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
        steamFreeGames: [] as ExtendedEpicGame[],
        gamerPowerGames: [] as ExtendedEpicGame[],
        trendingGames: [] as ExtendedEpicGame[],
        totalGames: 0
      },
      // Hata durumunda 1 saat sonra yeniden dene
      revalidate: 3600,
    };
  }
}; 