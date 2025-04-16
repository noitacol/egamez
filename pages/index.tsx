import { useState, useEffect } from 'react';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard, { ExtendedEpicGame } from '../components/GameCard';
import GameSlider from '../components/GameSlider';
import { getFreeGames, getUpcomingFreeGames, EpicGame } from '../lib/epic-api';
import { getFreeSteamGames, getTrendingSteamGames, convertSteamToEpicFormat } from '../lib/steam-api';
import { FiFilter, FiBarChart2, FiArrowUp, FiArrowDown, FiGift, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { SiEpicgames, SiSteam } from 'react-icons/si';

type SortOption = 'title' | 'date';
type SortDirection = 'asc' | 'desc';
type FilterSource = 'all' | 'epic' | 'steam';

interface HomeProps {
  epicFreeGames: EpicGame[];
  steamFreeGames: EpicGame[];
  upcomingFreeGames: EpicGame[];
  trendingGames: EpicGame[];
}

const Home: NextPage<HomeProps> = ({ epicFreeGames, steamFreeGames, upcomingFreeGames, trendingGames }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<FilterSource>('all');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [freeGames, setFreeGames] = useState<ExtendedEpicGame[]>([]);

  // Ücretsiz oyunları Epic ve Steam'den birleştir ve filtrele
  useEffect(() => {
    try {
      let combinedGames: ExtendedEpicGame[] = [];
      
      // Kaynak filtresine göre oyunları ekle
      if (filterSource === 'all' || filterSource === 'epic') {
        combinedGames = [...combinedGames, ...epicFreeGames as ExtendedEpicGame[]];
      }
      
      if (filterSource === 'all' || filterSource === 'steam') {
        combinedGames = [...combinedGames, ...steamFreeGames as ExtendedEpicGame[]];
      }
      
      // Sıralamayı uygula
      const sortedGames = [...combinedGames].sort((a, b) => {
        if (sortBy === 'title') {
          return sortDirection === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else if (sortBy === 'date') {
          const dateA = a.effectiveDate ? new Date(a.effectiveDate).getTime() : 0;
          const dateB = b.effectiveDate ? new Date(b.effectiveDate).getTime() : 0;
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return 0;
      });
      
      setFreeGames(sortedGames);
    } catch (err) {
      console.error('Oyunları filtreleme ve sıralama hatası:', err);
      setError('Oyunlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setIsLoading(false);
    }
  }, [epicFreeGames, steamFreeGames, filterSource, sortBy, sortDirection]);

  return (
    <Layout>
      <Head>
        <title>EpicAPI - Ücretsiz Oyunlar Keşfedin</title>
        <meta name="description" content="Epic Games ve Steam'den ücretsiz ve indirimli oyunları keşfedin." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Trendler Slider */}
        <section className="mb-16">
          <GameSlider 
            games={trendingGames as ExtendedEpicGame[]} 
            title="Trend Oyunlar" 
            icon={<FiTrendingUp size={20} />} 
            isTrending={true}
            emptyMessage="Şu anda trend oyun bulunmuyor."
          />
        </section>

        {/* Toplam oyun sayısı*/}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-epicblue to-epicaccent">
              Ücretsiz Oyunlar
            </span>
          </h1>
          <div className="flex gap-4 items-center">
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center gap-2">
              <SiEpicgames className="text-epicblue" />
              <span className="font-semibold">{epicFreeGames.length}</span>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center gap-2">
              <SiSteam className="text-epicblue" />
              <span className="font-semibold">{steamFreeGames.length}</span>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center gap-2">
              <span className="font-semibold">Toplam: {epicFreeGames.length + steamFreeGames.length}</span>
            </div>
          </div>
        </div>

        {/* Filtreleme ve sıralama kontrolleri */}
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-3 px-4 rounded-lg shadow-md mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <FiFilter className="text-epicblue dark:text-epicaccent" />
                <select 
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value as FilterSource)}
                  className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 text-sm py-1 px-2 focus:ring-2 focus:ring-epicblue dark:focus:ring-epicaccent focus:outline-none"
                >
                  <option value="all">Tüm Platformlar</option>
                  <option value="epic">Epic Games</option>
                  <option value="steam">Steam</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <FiBarChart2 className="text-epicblue dark:text-epicaccent" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 text-sm py-1 px-2 focus:ring-2 focus:ring-epicblue dark:focus:ring-epicaccent focus:outline-none"
                >
                  <option value="title">İsim</option>
                  <option value="date">Tarih</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
              aria-label={sortDirection === 'asc' ? 'Artan sıralama' : 'Azalan sıralama'}
            >
              {sortDirection === 'asc' ? (
                <>
                  <FiArrowUp size={16} /> 
                  <span className="hidden sm:inline text-sm">Artan</span>
                </>
              ) : (
                <>
                  <FiArrowDown size={16} /> 
                  <span className="hidden sm:inline text-sm">Azalan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Yükleme ve hata durumları */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-epicblue"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Epic ve Steam'den ücretsiz oyunlar */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {freeGames.length > 0 ? (
              freeGames.map((game) => (
                <GameCard 
                  key={`${game.id}-${game.source || 'epic'}`} 
                  game={game} 
                  isFree={true}
                />
              ))
            ) : (
              <div className="col-span-full py-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Seçilen filtrelere uygun ücretsiz oyun bulunamadı.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Yakında ücretsiz olacak oyunlar */}
        <section className="mb-16">
          <GameSlider 
            games={upcomingFreeGames as ExtendedEpicGame[]} 
            title="Yakında Ücretsiz Olacak Oyunlar" 
            icon={<FiCalendar size={20} />}
            isUpcoming={true} 
            emptyMessage="Yakında ücretsiz olacak oyun bulunmuyor."
          />
        </section>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Epic Games API'sinden ücretsiz oyunları al
    const epicFreeGames = await getFreeGames();
    
    // Epic Games API'sinden yakında ücretsiz olacak oyunları al
    const upcomingFreeGames = await getUpcomingFreeGames();
    
    // Steam API'sinden ücretsiz oyunları al
    const steamFreeGames = await getFreeSteamGames();
    
    // Steam API'sinden trend oyunları al
    const trendingGames = await getTrendingSteamGames();
    
    // Epic Games için kaynak bilgisini ekle
    const epicGamesWithSource = epicFreeGames.map(game => ({
      ...game,
      source: 'epic'
    }));
    
    // Steam oyunları için kaynak bilgisini ekle
    const steamGamesWithSource = steamFreeGames.map(game => ({
      ...game,
      source: 'steam'
    }));
    
    // Tüm veriyi prop olarak döndür
    return {
      props: {
        epicFreeGames: epicGamesWithSource,
        steamFreeGames: steamGamesWithSource,
        upcomingFreeGames,
        trendingGames
      },
      // 1 saat (3600 saniye) sonra sayfayı yeniden oluştur
      revalidate: 3600
    };
  } catch (error) {
    console.error('getStaticProps error:', error);
    
    // Hata durumunda boş veri ile devam et
    return {
      props: {
        epicFreeGames: [],
        steamFreeGames: [],
        upcomingFreeGames: [],
        trendingGames: []
      },
      // Hata durumunda 15 dakika (900 saniye) sonra tekrar dene
      revalidate: 900
    };
  }
};

export default Home; 