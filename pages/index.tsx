import { GetStaticProps } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import { getFreeGames, getUpcomingFreeGames, getTrendingEpicGames } from "@/lib/epic-api";
import { getFreeSteamGames, getTemporaryFreeSteamGames, getTrendingSteamGames } from "@/lib/steam-api";
import FreeGamesList from "@/components/FreeGamesList";
import GameCard from "@/components/GameCard";
import { ExtendedEpicGame } from "@/lib/types";
import { motion } from "framer-motion";
import { FaGamepad, FaChevronRight, FaSteam } from "react-icons/fa";
import { SiEpicgames } from "react-icons/si";
import { BiGift } from "react-icons/bi";
import { IoMdHourglass } from "react-icons/io";
import { HiOutlineTrendingUp } from "react-icons/hi";

interface HomeProps {
  epicFreeGames: ExtendedEpicGame[];
  upcomingEpicGames: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  temporaryFreeGames: ExtendedEpicGame[];
  trendingGames: ExtendedEpicGame[];
  totalGames: number;
}

export default function Home({
  epicFreeGames = [],
  upcomingEpicGames = [],
  steamFreeGames = [],
  temporaryFreeGames = [],
  trendingGames = [],
  totalGames = 0
}: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'free' | 'upcoming' | 'temp' | 'trending'>('free');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode algılama
  useEffect(() => {
    // Tarayıcının tercihini kontrol et
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    // Değişiklikleri dinle
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <Head>
        <title>GameHub - Epic Games ve Steam'deki Ücretsiz Oyunları Keşfedin</title>
        <meta name="description" content="Epic Games ve Steam'deki ücretsiz ve yakında ücretsiz olacak oyunları keşfedin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaGamepad className="text-blue-600 dark:text-blue-400 h-7 w-7" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">GameHub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1">
              <SiEpicgames className="text-gray-700 dark:text-gray-300 h-5 w-5" />
              <span className="text-sm font-medium">Epic</span>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <FaSteam className="text-gray-700 dark:text-gray-300 h-5 w-5" />
              <span className="text-sm font-medium">Steam</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8"
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Ücretsiz Oyunlar Dünyasına Hoş Geldiniz</h2>
                <p className="text-blue-100 max-w-2xl mb-6">
                  Epic Games ve Steam platformlarında bulunan ücretsiz oyunları keşfedin ve kütüphanenizi genişletin.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex flex-col items-center">
                    <div className="text-3xl font-bold text-white mb-1">{totalGames}</div>
                    <div className="text-sm text-blue-100">Toplam Oyun</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex flex-col items-center">
                    <div className="text-3xl font-bold text-white mb-1">{epicFreeGames.length + steamFreeGames.length}</div>
                    <div className="text-sm text-blue-100">Ücretsiz Oyun</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex flex-col items-center">
                    <div className="text-3xl font-bold text-white mb-1">{upcomingEpicGames.length}</div>
                    <div className="text-sm text-blue-100">Yakında Ücretsiz</div>
                  </div>
                </div>
              </div>
              
              {/* Dekoratif arka plan elemanları */}
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/5 rounded-full"></div>
              <div className="absolute top-10 -right-20 w-40 h-40 bg-white/5 rounded-full"></div>
            </div>
          </motion.div>

          {/* Tab butonları */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab('free')}
              className={`py-2 px-4 flex items-center font-medium rounded-full transition-all ${
                activeTab === 'free'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <BiGift className="mr-2" size={18} />
              Ücretsiz Oyunlar
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-4 flex items-center font-medium rounded-full transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <IoMdHourglass className="mr-2" size={18} />
              Yakında Ücretsiz
            </button>
            <button
              onClick={() => setActiveTab('temp')}
              className={`py-2 px-4 flex items-center font-medium rounded-full transition-all ${
                activeTab === 'temp'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FaChevronRight className="mr-2" size={18} />
              Sınırlı Süre Ücretsiz
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`py-2 px-4 flex items-center font-medium rounded-full transition-all ${
                activeTab === 'trending'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <HiOutlineTrendingUp className="mr-2" size={18} />
              Trend Oyunlar
            </button>
          </div>
          
          {/* Tab içeriği */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {activeTab === 'free' && (
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-xl">
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                  </div>
                ) : (
                  <FreeGamesList epicGames={epicFreeGames} steamGames={steamFreeGames} />
                )}
              </>
            )}
            
            {activeTab === 'upcoming' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Yakında Ücretsiz Olacak Oyunlar</h2>
                  <div className="flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                    <SiEpicgames className="mr-1.5" size={14} />
                    Epic Games
                  </div>
                </div>
                
                {upcomingEpicGames.length === 0 ? (
                  <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-xl text-center">
                    <p className="text-gray-600 dark:text-gray-400">Şu anda yakında ücretsiz olacak oyun bulunamadı.</p>
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
            
            {activeTab === 'temp' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Sınırlı Süre Ücretsiz Oyunlar</h2>
                  <div className="flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                    <FaSteam className="mr-1.5" size={14} />
                    Steam
                  </div>
                </div>
                
                {temporaryFreeGames.length === 0 ? (
                  <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-xl text-center">
                    <p className="text-gray-600 dark:text-gray-400">Şu anda geçici olarak ücretsiz oyun bulunamadı.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {temporaryFreeGames.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        isFree 
                        temporaryFreeGame
                        isSteam
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'trending' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Trend Olan Ücretsiz Oyunlar</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                      <SiEpicgames className="mr-1.5" size={14} />
                      Epic
                    </div>
                    <div className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                      <FaSteam className="mr-1.5" size={14} />
                      Steam
                    </div>
                  </div>
                </div>
                
                {trendingGames.length === 0 ? (
                  <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-xl text-center">
                    <p className="text-gray-600 dark:text-gray-400">Şu anda trend olan ücretsiz oyun bulunamadı.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {trendingGames.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        trending
                        isFree
                        isSteam={game.platform === 'steam'}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </section>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FaGamepad className="text-blue-600 dark:text-blue-400 h-6 w-6 mr-2" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">GameHub</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Bu site, Epic Games ve Steam'deki ücretsiz oyunları bulmanıza yardımcı olmak için oluşturulmuştur. Resmi bir site değildir.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Epic Games ve Steam'den ücretsiz oyunları getir
    let epicFreeGames = await getFreeGames() || [];
    let upcomingEpicGames = await getUpcomingFreeGames() || [];
    let steamFreeGames = await getFreeSteamGames() || [];
    let temporaryFreeGames = await getTemporaryFreeSteamGames() || [];
    
    // Trend oyunları getir
    let epicTrendingGames = await getTrendingEpicGames() || [];
    let steamTrendingGames = await getTrendingSteamGames() || [];
    let trendingGames = [...epicTrendingGames, ...steamTrendingGames];
    
    // Serileştirme hatalarını önlemek için veriyi temizleyelim
    const safelySerialize = (data: any) => {
      return JSON.parse(JSON.stringify(data || []));
    };
    
    // Verileri temizle
    epicFreeGames = safelySerialize(epicFreeGames);
    upcomingEpicGames = safelySerialize(upcomingEpicGames);
    steamFreeGames = safelySerialize(steamFreeGames);
    temporaryFreeGames = safelySerialize(temporaryFreeGames);
    trendingGames = safelySerialize(trendingGames);
    
    // Oyun verilerini kontrol et ve eksik alanları tamamla
    const sanitizeGames = (games: ExtendedEpicGame[]) => {
      return games.map(game => ({
        ...game,
        title: game.title || 'İsimsiz Oyun',
        id: game.id || `game-${Math.random().toString(36).substr(2, 9)}`,
        effectiveDate: game.effectiveDate || new Date().toISOString()
      }));
    };
    
    // Tüm oyun listelerini temizle
    epicFreeGames = sanitizeGames(epicFreeGames);
    upcomingEpicGames = sanitizeGames(upcomingEpicGames);
    steamFreeGames = sanitizeGames(steamFreeGames);
    temporaryFreeGames = sanitizeGames(temporaryFreeGames);
    trendingGames = sanitizeGames(trendingGames);
    
    const totalGames = epicFreeGames.length + upcomingEpicGames.length + steamFreeGames.length + temporaryFreeGames.length;

    return {
      props: {
        epicFreeGames,
        upcomingEpicGames,
        steamFreeGames,
        temporaryFreeGames,
        trendingGames,
        totalGames
      },
      // Her 6 saatte bir yeniden oluştur
      revalidate: 6 * 60 * 60,
    };
  } catch (error) {
    console.error("Oyun verileri alınırken hata oluştu:", error);
    
    return {
      props: {
        epicFreeGames: [],
        upcomingEpicGames: [],
        steamFreeGames: [],
        temporaryFreeGames: [],
        trendingGames: [],
        totalGames: 0
      },
      revalidate: 60 * 60, // Bir saat sonra yeniden dene
    };
  }
};