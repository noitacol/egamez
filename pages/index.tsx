import { GetStaticProps } from "next";
import { useState } from "react";
import Head from "next/head";
import { getFreeGames, getUpcomingFreeGames, getTrendingEpicGames } from "@/lib/epic-api";
import { getFreeSteamGames, getTrendingSteamGames } from "@/lib/steam-api";
import { getFreeGamerPowerGames, getTrendingGamerPowerGames } from "@/lib/gamerpower-api";
import FreeGamesList from "@/components/FreeGamesList";
import GameCard from "@/components/GameCard";
import { ExtendedEpicGame } from "@/lib/types";

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

  return (
    <>
      <Head>
        <title>EpicAPI - Epic Games ve Ücretsiz Oyunları Keşfedin</title>
        <meta name="description" content="Epic Games ve tüm platformlardaki ücretsiz oyunları keşfedin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h1 className="text-3xl font-bold mb-4">Ücretsiz Oyunlar</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Epic Games, Steam ve diğer platformlarda bulunan şu anda ücretsiz olan ve yakında ücretsiz olacak oyunları keşfedin.
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full flex items-center text-sm">
                <span className="font-medium mr-2">Toplam Ücretsiz Oyun:</span> 
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                  {epicFreeGames.length + steamFreeGames.length + gamerPowerGames.length}
                </span>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full flex items-center text-sm">
                <span className="font-medium mr-2">Epic'te Ücretsiz:</span>
                <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                  {epicFreeGames.length}
                </span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center text-sm">
                <span className="font-medium mr-2">Steam'de Ücretsiz:</span>
                <span className="bg-gray-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                  {steamFreeGames.length}
                </span>
              </div>
              <div className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full flex items-center text-sm">
                <span className="font-medium mr-2">PC Oyunları:</span>
                <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                  {gamerPowerGames.filter(game => 
                    game.platform?.toLowerCase().includes('pc') || 
                    game.platform?.toLowerCase().includes('steam') || 
                    game.platform?.toLowerCase().includes('epic')
                  ).length}
                </span>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full flex items-center text-sm">
                <span className="font-medium mr-2">Yakında Ücretsiz:</span>
                <span className="bg-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                  {upcomingEpicGames.length}
                </span>
              </div>
            </div>
          </div>

          {/* Tab butonları */}
          <div className="flex space-x-2 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('free')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'free'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ücretsiz Oyunlar
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'upcoming'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yakında Ücretsiz
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'trending'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Trend Oyunlar
            </button>
          </div>
          
          {/* Tab içeriği */}
          <div className="mt-4">
            {activeTab === 'free' && (
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-100 p-4 rounded-lg">
                    <p className="text-red-700">{error}</p>
                  </div>
                ) : (
                  <FreeGamesList 
                    epicGames={epicFreeGames} 
                    steamGames={steamFreeGames}
                    gamerPowerGames={gamerPowerGames} 
                  />
                )}
              </>
            )}
            
            {activeTab === 'upcoming' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Yakında Ücretsiz Olacak Oyunlar</h2>
                
                {upcomingEpicGames.length === 0 ? (
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <p>Şu anda yakında ücretsiz olacak oyun bulunamadı.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {upcomingEpicGames.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        isUpcoming 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'trending' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Trend Oyunlar</h2>
                
                {trendingGames.length === 0 ? (
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <p>Şu anda trend oyun bulunamadı.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {trendingGames.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        isTrending 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
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
      return games.map(game => ({
        ...game,
        title: game.title || 'İsimsiz Oyun',
        id: game.id || `game-${Math.random().toString(36).substr(2, 9)}`,
        effectiveDate: game.effectiveDate || new Date().toISOString(),
        categories: game.categories || [],
        price: game.price || {
          totalPrice: {
            originalPrice: 0,
            discountPrice: 0,
            discount: 0
          }
        }
      })) as ExtendedEpicGame[];
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