import { useState, useEffect } from 'react';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { getFreeGames, getUpcomingFreeGames } from '../lib/epic-api';
import { getFreeSteamGames, getTrendingSteamGames, convertSteamToEpicFormat } from '../lib/steam-api';
import { ExtendedEpicGame } from '../components/GameCard';
import { BsThermometerHigh } from 'react-icons/bs';
import { FaSteam } from 'react-icons/fa';
import { SiEpicgames } from 'react-icons/si';
import { MdUpcoming } from 'react-icons/md';

interface HomeProps {
  epicFreeGames: ExtendedEpicGame[];
  epicUpcomingGames: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  steamTrendingGames: ExtendedEpicGame[];
}

export default function Home({ epicFreeGames, epicUpcomingGames, steamFreeGames, steamTrendingGames }: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtreleme ve sıralama için state
  const [filterSource, setFilterSource] = useState<'all' | 'epic' | 'steam'>('all');
  const [sortOrder, setSortOrder] = useState<'default' | 'name' | 'date'>('default');
  
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
    if (sortOrder === 'name') {
      // İsme göre sırala (A-Z)
      trending.sort((a, b) => a.title.localeCompare(b.title));
      epic.sort((a, b) => a.title.localeCompare(b.title));
      steam.sort((a, b) => a.title.localeCompare(b.title));
      upcoming.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'date') {
      // Ekleniş tarihine göre sırala (yeniden eskiye)
      trending.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
      epic.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
      steam.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
      upcoming.sort((a, b) => {
        const dateA = a.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate;
        const dateB = b.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate;
        if (dateA && dateB) {
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        }
        return 0;
      });
    }
    
    // State'leri güncelle
    setFilteredTrending(trending);
    setFilteredEpic(epic);
    setFilteredSteam(steam);
    setFilteredUpcoming(upcoming);
    
  }, [filterSource, sortOrder, epicFreeGames, epicUpcomingGames, steamFreeGames, steamTrendingGames]);
  
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
      <div className="mb-12">
        <h1 className="section-title text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-epicblue to-epicaccent bg-clip-text text-transparent">
          Ücretsiz Oyunlar Platformu
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mb-6">
          Epic Games ve Steam'de şu anda ücretsiz olarak sunulan tüm oyunları keşfedin ve fırsatları kaçırmayın. Hemen kütüphanenize ekleyin!
        </p>
        
        {/* Filtreleme ve Sıralama Kontrolleri */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="bg-white/80 dark:bg-epicgray/80 p-3 rounded-lg shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <label htmlFor="filter-source" className="text-sm text-gray-600 dark:text-gray-400 mr-3 font-medium">
              Platform:
            </label>
            <select 
              id="filter-source"
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as any)}
              className="bg-transparent border-none text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-epicblue/50 rounded px-2 py-1"
            >
              <option value="all">Tümü</option>
              <option value="epic">Sadece Epic</option>
              <option value="steam">Sadece Steam</option>
            </select>
          </div>
          
          <div className="bg-white/80 dark:bg-epicgray/80 p-3 rounded-lg shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <label htmlFor="sort-order" className="text-sm text-gray-600 dark:text-gray-400 mr-3 font-medium">
              Sıralama:
            </label>
            <select 
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-transparent border-none text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-epicblue/50 rounded px-2 py-1"
            >
              <option value="default">Önerilen</option>
              <option value="name">İsim (A-Z)</option>
              <option value="date">Tarih (Yeni-Eski)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Site aktivitesini göster */}
      <div className="bg-gradient-to-r from-epicblue/10 to-epicaccent/10 dark:from-epicblue/20 dark:to-epicaccent/20 mb-10 py-6 px-6 rounded-xl backdrop-blur-sm shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 transform transition-transform hover:scale-105">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent mb-2">
              {totalGames}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1 font-medium">
              Toplam Oyun
            </div>
          </div>
          <div className="text-center p-4 transform transition-transform hover:scale-105">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent mb-2">
              {filteredEpic.length}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1 font-medium">
              Epic Games
            </div>
          </div>
          <div className="text-center p-4 transform transition-transform hover:scale-105">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent mb-2">
              {filteredSteam.length + filteredTrending.length}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1 font-medium">
              Steam
            </div>
          </div>
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
      
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-epicblue border-t-epicaccent rounded-full animate-spin"></div>
        </div>
      )}
      
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
      
      {/* Steam Trend Oyunlar Bölümü */}
      {filteredTrending.length > 0 && !isLoading && !error && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="bg-gradient-to-r from-orange-500 to-epicaccent p-1.5 mr-2 rounded text-white">
              <BsThermometerHigh className="h-5 w-5" />
            </span>
            <span className="bg-gradient-to-r from-orange-500/80 to-epicaccent/80 bg-clip-text text-transparent">
              Steam'de Trend Ücretsiz Oyunlar
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" 
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${getGridWidth(filteredTrending.length)}, 1fr))`
            }}>
            {filteredTrending.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                isFree={true}
                isTrending={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Epic Games Ücretsiz Oyunlar Bölümü */}
      {filteredEpic.length > 0 && !isLoading && !error ? (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="bg-gradient-to-r from-epicblue to-blue-600 p-1.5 mr-2 rounded text-white">
              <SiEpicgames className="h-5 w-5" />
            </span>
            <span className="bg-gradient-to-r from-epicblue/80 to-blue-600/80 bg-clip-text text-transparent">
              Epic Games'te Ücretsiz
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" 
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${getGridWidth(filteredEpic.length)}, 1fr))`
            }}>
            {filteredEpic.map((game) => (
              <GameCard key={game.id} game={game} isFree={true} />
            ))}
          </div>
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
              <FaSteam className="h-5 w-5" />
            </span>
            <span className="bg-gradient-to-r from-gray-700/80 to-gray-900/80 bg-clip-text text-transparent">
              Steam'de Popüler Ücretsiz Oyunlar
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" 
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${getGridWidth(filteredSteam.length)}, 1fr))`
            }}>
            {filteredSteam.map((game) => (
              <GameCard key={game.id} game={game} isFree={true} />
            ))}
          </div>
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
              <MdUpcoming className="h-5 w-5" />
            </span>
            <span className="bg-gradient-to-r from-purple-600/80 to-purple-800/80 bg-clip-text text-transparent">
              Yakında Ücretsiz Olacak
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" 
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${getGridWidth(filteredUpcoming.length)}, 1fr))`
            }}>
            {filteredUpcoming.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                isUpcoming={true} 
              />
            ))}
          </div>
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