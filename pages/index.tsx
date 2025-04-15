import { useState, useEffect } from 'react';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import Slider from '../components/Slider';
import { getFreeGames, getUpcomingFreeGames, EpicGame } from '../lib/epic-api';
import { getFreeSteamGames, getTrendingSteamGames, convertSteamToEpicFormat } from '../lib/steam-api';
import { ExtendedEpicGame } from '../components/GameCard';
import { FiTrendingUp, FiFilter, FiArrowDown, FiArrowUp, FiBarChart2, FiGift, FiCalendar } from 'react-icons/fi';
import { SiEpicgames } from 'react-icons/si';
import { FaSteam } from 'react-icons/fa';
import GameSlider from '../components/GameSlider';

interface HomeProps {
  epicFreeGames: ExtendedEpicGame[];
  epicUpcomingGames: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  steamTrendingGames: ExtendedEpicGame[];
}

type SortOption = 'title' | 'date';
type SortDirection = 'asc' | 'desc';

export default function Home({ epicFreeGames, epicUpcomingGames, steamFreeGames, steamTrendingGames }: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtreleme ve sıralama için state
  const [filterSource, setFilterSource] = useState<'all' | 'epic' | 'steam'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Filtrelenmiş oyun listeleri
  const [filteredTrending, setFilteredTrending] = useState(steamTrendingGames);
  const [filteredEpic, setFilteredEpic] = useState(epicFreeGames);
  const [filteredSteam, setFilteredSteam] = useState(steamFreeGames);
  const [filteredUpcoming, setFilteredUpcoming] = useState(epicUpcomingGames);
  
  // Filtre ve sıralama değişince oyun listelerini güncelle
  useEffect(() => {
    // Trend Steam oyunları
    let trending = [...steamTrendingGames];
    
    // Epic oyunları
    let epic = [...epicFreeGames];
    
    // Steam oyunları
    let steam = [...steamFreeGames];
    
    // Yaklaşan Epic oyunları
    let upcoming = [...epicUpcomingGames];
    
    // Kaynak filtresi uygula
    if (filterSource === 'epic') {
      trending = [];
      steam = [];
    } else if (filterSource === 'steam') {
      epic = [];
      upcoming = [];
    }
    
    // Sıralama uygula
    const sortGames = (games: ExtendedEpicGame[], isUpcoming = false) => {
      return [...games].sort((a, b) => {
        if (sortBy === 'title') {
          return sortDirection === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else if (sortBy === 'date') {
          let dateA, dateB;
          
          if (isUpcoming) {
            dateA = a.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate 
              ? new Date(a.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate).getTime()
              : 0;
            dateB = b.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate
              ? new Date(b.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate).getTime()
              : 0;
          } else {
            dateA = new Date(a.effectiveDate || 0).getTime();
            dateB = new Date(b.effectiveDate || 0).getTime();
          }
          
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return 0;
      });
    };
    
    // Sıralanmış listeleri ayarla
    setFilteredTrending(sortGames(trending));
    setFilteredEpic(sortGames(epic));
    setFilteredSteam(sortGames(steam));
    setFilteredUpcoming(sortGames(upcoming, true));
    
  }, [filterSource, sortBy, sortDirection, epicFreeGames, epicUpcomingGames, steamFreeGames, steamTrendingGames]);
  
  // Tüm oyunlar
  const totalGames = filteredEpic.length + filteredUpcoming.length + 
                     filteredSteam.length + filteredTrending.length;

  return (
    <Layout>
      <Head>
        <title>Ücretsiz Oyunlar | Epic ve Steam</title>
        <meta name="description" content="Epic Games ve Steam platformlarından ücretsiz oyunlar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Hero Banner */}
      <section className="relative mb-12 py-16 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-epicblue/90 to-epicpurple/90 z-10"></div>
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.png')] opacity-10 mix-blend-overlay"></div>
        
        <div className="relative z-20 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
            Ücretsiz <span className="text-epicaccent">Oyunlar</span>
          </h1>
          <p className="text-gray-200 md:text-lg max-w-2xl mx-auto mb-8">
            Epic Games ve Steam platformlarından güncel ücretsiz oyunları keşfedin.
          </p>
          
          {/* İstatistik kartları */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center shadow-lg transform transition-transform hover:scale-105">
              <div className="text-3xl font-bold text-white mb-1">{totalGames}</div>
              <div className="text-gray-200 text-sm">Toplam Oyun</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center shadow-lg transform transition-transform hover:scale-105">
              <div className="text-3xl font-bold text-white mb-1">{filteredEpic.length}</div>
              <div className="text-gray-200 text-sm">Epic Ücretsiz</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center shadow-lg transform transition-transform hover:scale-105">
              <div className="text-3xl font-bold text-white mb-1">{filteredSteam.length + filteredTrending.length}</div>
              <div className="text-gray-200 text-sm">Steam Ücretsiz</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center shadow-lg transform transition-transform hover:scale-105">
              <div className="text-3xl font-bold text-white mb-1">{filteredUpcoming.length}</div>
              <div className="text-gray-200 text-sm">Yakında Ücretsiz</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtreleme ve sıralama kontrolleri */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-3 px-4 rounded-lg shadow-md mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-epicblue dark:text-epicaccent" />
            <select 
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as any)}
              className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 text-sm py-1 px-2 focus:ring-2 focus:ring-epicblue dark:focus:ring-epicaccent focus:outline-none"
            >
              <option value="all">Tüm Platformlar</option>
              <option value="epic">Epic Games</option>
              <option value="steam">Steam</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 text-sm py-1 px-2 focus:ring-2 focus:ring-epicblue dark:focus:ring-epicaccent focus:outline-none"
              >
                <option value="title">İsim</option>
                <option value="date">Tarih</option>
              </select>
              <button 
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={sortDirection === 'asc' ? 'Artan sıralama' : 'Azalan sıralama'}
              >
                {sortDirection === 'asc' ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 text-red-700 dark:text-red-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Ana İçerik */}
      <div className="space-y-16">
        {/* Trend Oyunlar */}
        {filteredTrending.length > 0 && !isLoading && !error && (
          <section>
            <GameSlider 
              games={filteredTrending} 
              title="Trend Oyunlar" 
              icon={<FiTrendingUp />}
              isTrending={true}
            />
          </section>
        )}

        {/* Epic Games Ücretsiz Oyunlar */}
        {filteredEpic.length > 0 && !isLoading && !error ? (
          <section>
            <GameSlider 
              games={filteredEpic} 
              title="Epic Games'te Ücretsiz" 
              icon={<SiEpicgames />}
              isFree={true}
            />
          </section>
        ) : !isLoading && !error && filterSource !== 'steam' && (
          <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <SiEpicgames className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                Epic Games'te şu anda ücretsiz oyun bulunmuyor.
              </p>
            </div>
          </section>
        )}
        
        {/* Steam Ücretsiz Oyunlar */}
        {filteredSteam.length > 0 && !isLoading && !error ? (
          <section>
            <GameSlider 
              games={filteredSteam} 
              title="Steam'de Popüler Ücretsiz Oyunlar" 
              icon={<FaSteam />}
              isFree={true}
            />
          </section>
        ) : !isLoading && !error && filterSource !== 'epic' && (
          <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <FaSteam className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                Steam'de şu anda ücretsiz oyun bilgisi çekilemiyor.
              </p>
            </div>
          </section>
        )}

        {/* Yakında Ücretsiz Olacak Oyunlar */}
        {filteredUpcoming.length > 0 && !isLoading && !error && (
          <section>
            <GameSlider 
              games={filteredUpcoming} 
              title="Yakında Ücretsiz Olacak" 
              icon={<FiCalendar />}
              isUpcoming={true}
            />
          </section>
        )}
      </div>
      
      {/* Platform Bilgi Kutuları */}
      <section className="mt-20 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Epic Games Kutusu */}
          <div className="relative overflow-hidden rounded-xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-epicblue to-epicpurple opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10"></div>
            
            <div className="relative z-10 p-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <SiEpicgames className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Epic Games Ücretsiz Oyunlar</h2>
              <p className="text-gray-100 mb-6 max-w-md">
                Epic Games Store, her hafta yeni ücretsiz oyunlar sunuyor. Bu sitede, mevcut ücretsiz oyunları ve gelecekte ücretsiz olacak oyunları kolayca takip edebilirsiniz.
              </p>
              <a
                href="https://store.epicgames.com/tr/free-games"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
              >
                <span>Epic Games Store'u Ziyaret Et</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Steam Kutusu */}
          <div className="relative overflow-hidden rounded-xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10"></div>
            
            <div className="relative z-10 p-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <FaSteam className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Steam Ücretsiz Oyunlar</h2>
              <p className="text-gray-100 mb-6 max-w-md">
                Steam'de her zaman oynayabileceğiniz ücretsiz oyunlar ve dönemsel olarak ücretsiz hale gelen oyunlar bulunmaktadır. Fırsatları kaçırmamak için takipte kalın!
              </p>
              <a
                href="https://store.steampowered.com/genre/Free%20to%20Play/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
              >
                <span>Steam Store'u Ziyaret Et</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    // Paralel olarak tüm API isteklerini yapıyoruz
    const [epicFreeGamesData, epicUpcomingGamesData, steamFreeGamesData, steamTrendingGamesData] = await Promise.all([
      getFreeGames(),
      getUpcomingFreeGames(),
      getFreeSteamGames().then(games => games.map(convertSteamToEpicFormat)),
      getTrendingSteamGames().then(games => games.map(convertSteamToEpicFormat)),
    ]);

    // Tüm verileri bir araya getiriyoruz
    return {
      props: {
        epicFreeGames: epicFreeGamesData as ExtendedEpicGame[],
        epicUpcomingGames: epicUpcomingGamesData as ExtendedEpicGame[],
        steamFreeGames: steamFreeGamesData as ExtendedEpicGame[],
        steamTrendingGames: steamTrendingGamesData as ExtendedEpicGame[],
      },
      revalidate: 1800, // 30 dakikada bir yeniden oluştur
    };
  } catch (error) {
    console.error('API istekleri sırasında hata:', error);
    
    // Hata durumunda boş dizilerle devam et
    return {
      props: {
        epicFreeGames: [] as ExtendedEpicGame[],
        epicUpcomingGames: [] as ExtendedEpicGame[],
        steamFreeGames: [] as ExtendedEpicGame[],
        steamTrendingGames: [] as ExtendedEpicGame[],
      },
      revalidate: 300, // Hata durumunda 5 dakika sonra tekrar dene
    };
  }
}; 