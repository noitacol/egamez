import { useState, useEffect } from 'react';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import Slider from '../components/Slider';
import { getFreeGames, getUpcomingFreeGames, EpicGame } from '../lib/epic-api';
import { getFreeSteamGames, getTrendingSteamGames, convertSteamToEpicFormat } from '../lib/steam-api';
import { ExtendedEpicGame } from '../components/GameCard';
import { BsThermometerHigh } from 'react-icons/bs';
import { FaSteam } from 'react-icons/fa';
import { SiEpicgames } from 'react-icons/si';
import { MdUpcoming } from 'react-icons/md';
import { FiFilter, FiArrowDown, FiArrowUp, FiTrendingUp, FiBarChart2, FiGift, FiCalendar } from 'react-icons/fi';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
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
  
  // Keen Slider
  const [trendingSliderRef] = useKeenSlider({
    mode: "snap",
    slides: {
      perView: 1.2,
      spacing: 15,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2.2, spacing: 15 },
      },
      '(min-width: 768px)': {
        slides: { perView: 3.2, spacing: 15 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 4.2, spacing: 15 },
      },
    },
  });

  const [freeEpicSliderRef] = useKeenSlider({
    mode: "snap",
    slides: {
      perView: 1.2,
      spacing: 15,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2.2, spacing: 15 },
      },
      '(min-width: 768px)': {
        slides: { perView: 3.2, spacing: 15 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 4.2, spacing: 15 },
      },
    },
  });

  const [freeSteamSliderRef] = useKeenSlider({
    mode: "snap",
    slides: {
      perView: 1.2,
      spacing: 15,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2.2, spacing: 15 },
      },
      '(min-width: 768px)': {
        slides: { perView: 3.2, spacing: 15 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 4.2, spacing: 15 },
      },
    },
  });
  
  const [upcomingSliderRef] = useKeenSlider({
    mode: "snap",
    slides: {
      perView: 1.2,
      spacing: 15,
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: { perView: 2.2, spacing: 15 },
      },
      '(min-width: 768px)': {
        slides: { perView: 3.2, spacing: 15 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 4.2, spacing: 15 },
      },
    },
  });
  
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
    if (sortBy === 'title') {
      // İsme göre sırala
      trending.sort((a, b) => {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      });
      epic.sort((a, b) => {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      });
      steam.sort((a, b) => {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      });
      upcoming.sort((a, b) => {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      });
    } else if (sortBy === 'date') {
      // Ekleniş tarihine göre sırala
      trending.sort((a, b) => {
        const dateA = new Date(a.effectiveDate).getTime();
        const dateB = new Date(b.effectiveDate).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
      epic.sort((a, b) => {
        const dateA = new Date(a.effectiveDate).getTime();
        const dateB = new Date(b.effectiveDate).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
      steam.sort((a, b) => {
        const dateA = new Date(a.effectiveDate).getTime();
        const dateB = new Date(b.effectiveDate).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
      upcoming.sort((a, b) => {
        const dateA = a.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate 
          ? new Date(a.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate).getTime()
          : 0;
        const dateB = b.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate
          ? new Date(b.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate).getTime()
          : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    
    // State'leri güncelle
    setFilteredTrending(trending);
    setFilteredEpic(epic);
    setFilteredSteam(steam);
    setFilteredUpcoming(upcoming);
    
  }, [filterSource, sortBy, sortDirection, epicFreeGames, epicUpcomingGames, steamFreeGames, steamTrendingGames]);
  
  // Tüm oyunlar
  const totalGames = filteredEpic.length + filteredUpcoming.length + 
                     filteredSteam.length + filteredTrending.length;
  
  // Grid için responsive genişlik ayarlaması
  const getGridWidth = (count: number) => {
    if (count === 1) return '100%';
    if (count === 2) return '45%';
    if (count === 3) return '30%';
    return '260px';
  };

  return (
    <Layout>
      <Head>
        <title>Ücretsiz Oyunlar | Epic ve Steam</title>
        <meta name="description" content="Epic Games ve Steam platformlarından ücretsiz oyunlar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-2">Ücretsiz <span className="bg-gradient-to-r from-epicblue to-epicaccent bg-clip-text text-transparent">Oyunlar</span></h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg">Epic Games ve Steam platformlarından güncel ücretsiz oyunları keşfedin.</p>
      </section>
      
      {/* İstatistik kutuları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="glass-card">
          <div className="text-center p-4 transform transition-transform hover:scale-105">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent mb-2">
              {totalGames}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1 font-medium">
              Toplam Oyun
            </div>
          </div>
        </div>
        <div className="glass-card">
          <div className="text-center p-4 transform transition-transform hover:scale-105">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent mb-2">
              {filteredEpic.length}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1 font-medium">
              Epic Ücretsiz
            </div>
          </div>
        </div>
        <div className="glass-card">
          <div className="text-center p-4 transform transition-transform hover:scale-105">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent mb-2">
              {filteredSteam.length + filteredTrending.length}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1 font-medium">
              Steam Ücretsiz
            </div>
          </div>
        </div>
        <div className="glass-card">
          <div className="text-center p-4 transform transition-transform hover:scale-105">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent mb-2">
              {filteredUpcoming.length}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1 font-medium">
              Yakında Ücretsiz
            </div>
          </div>
        </div>
      </div>

      {/* Filtreleme ve sıralama kontrolleri */}
      <div className="flex flex-wrap gap-4 mb-8 justify-between items-center">
        <div className="glass-card py-2 px-4 flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="platform-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Platform:
            </label>
            <select 
              id="platform-filter"
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as any)}
              className="bg-transparent border-none text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-epicblue/50 rounded px-2 py-1"
            >
              <option value="all">Tümü</option>
              <option value="epic">Epic</option>
              <option value="steam">Steam</option>
            </select>
          </div>
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-order" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sıralama:
            </label>
            <select 
              id="sort-order"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent border-none text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-epicblue/50 rounded px-2 py-1"
            >
              <option value="title">İsim</option>
              <option value="date">Tarih</option>
            </select>
            <button 
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              {sortDirection === 'asc' ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="glass-card p-6 mb-8 text-red-700 dark:text-red-300">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Trend Oyunlar Slider */}
      {filteredTrending.length > 0 && !isLoading && !error && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="bg-gradient-to-r from-red-600 to-orange-600 p-1.5 mr-2 rounded text-white">
              <FiTrendingUp />
            </span>
            <span className="bg-gradient-to-r from-red-500/80 to-orange-500/80 bg-clip-text text-transparent">
              Trend Oyunlar
            </span>
          </h2>
          <GameSlider 
            games={filteredTrending} 
            title="Trend Oyunlar" 
            icon={<FiTrendingUp />}
            isTrending={true}
          />
        </div>
      )}

      {/* Epic Games Ücretsiz Oyunlar Bölümü */}
      {filteredEpic.length > 0 && !isLoading && !error ? (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="bg-gradient-to-r from-epicblue to-blue-600 p-1.5 mr-2 rounded text-white">
              <FiGift />
            </span>
            <span className="bg-gradient-to-r from-epicblue/80 to-blue-600/80 bg-clip-text text-transparent">
              Epic Games'te Ücretsiz
            </span>
          </h2>
          <GameSlider 
            games={filteredEpic} 
            title="Epic Games Ücretsiz Oyunları" 
            icon={<FiGift />}
            isFree={true}
          />
        </div>
      ) : !isLoading && !error && filterSource !== 'steam' && (
        <div className="glass-card p-8 text-center mb-16">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Epic Games'te şu anda ücretsiz oyun bulunmuyor.
          </p>
        </div>
      )}
      
      {/* Steam Daima Ücretsiz Oyunlar Bölümü */}
      {filteredSteam.length > 0 && !isLoading && !error ? (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="bg-gradient-to-r from-gray-700 to-gray-900 p-1.5 mr-2 rounded text-white">
              <FiBarChart2 />
            </span>
            <span className="bg-gradient-to-r from-gray-700/80 to-gray-900/80 bg-clip-text text-transparent">
              Steam'de Popüler Ücretsiz Oyunlar
            </span>
          </h2>
          <GameSlider 
            games={filteredSteam} 
            title="Steam Ücretsiz Oyunları" 
            icon={<FiBarChart2 />}
            isFree={true}
          />
        </div>
      ) : !isLoading && !error && filterSource !== 'epic' && (
        <div className="glass-card p-8 text-center mb-16">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Steam'de şu anda ücretsiz oyun bilgisi çekilemiyor.
          </p>
        </div>
      )}

      {/* Yakında Ücretsiz Olacak Oyunlar Bölümü */}
      {filteredUpcoming.length > 0 && !isLoading && !error && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="bg-gradient-to-r from-purple-600 to-purple-800 p-1.5 mr-2 rounded text-white">
              <FiCalendar />
            </span>
            <span className="bg-gradient-to-r from-purple-600/80 to-purple-800/80 bg-clip-text text-transparent">
              Yakında Ücretsiz Olacak
            </span>
          </h2>
          <GameSlider 
            games={filteredUpcoming} 
            title="Yakında Ücretsiz Olacak Oyunlar" 
            icon={<FiCalendar />}
            isUpcoming={true}
          />
        </div>
      )}
      
      {/* Platform Bilgi Kutuları */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {/* Epic Games Kutusu */}
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-epicaccent/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-epicblue/10 rounded-full -ml-10 -mb-10"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">Epic Games Ücretsiz Oyunlar</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Epic Games Store, her hafta yeni ücretsiz oyunlar sunuyor. Bu sitede, mevcut ücretsiz oyunları ve gelecekte ücretsiz olacak oyunları kolayca takip edebilirsiniz.
              </p>
              <a
                href="https://store.epicgames.com/tr/free-games"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary inline-flex items-center"
              >
                <span>Epic Games Store'u Ziyaret Et</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Steam Kutusu */}
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-epicblue/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-epicaccent/10 rounded-full -ml-10 -mb-10"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">Steam Ücretsiz Oyunlar</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Steam'de her zaman oynayabileceğiniz ücretsiz oyunlar ve dönemsel olarak ücretsiz hale gelen oyunlar bulunmaktadır. Fırsatları kaçırmamak için takipte kalın!
              </p>
              <a
                href="https://store.steampowered.com/genre/Free%20to%20Play/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent inline-flex items-center"
              >
                <span>Steam Store'u Ziyaret Et</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
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