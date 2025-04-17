import { useState, useEffect } from 'react';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { getFreeGames, getUpcomingFreeGames } from '../lib/epic-api';
import { getFreeSteamGames, getTrendingSteamGames, convertSteamToEpicFormat, getTemporaryFreeSteamGames } from '../lib/steam-api';
import { ExtendedEpicGame } from '../components/GameCard';
import { FiFilter, FiArrowDown, FiArrowUp, FiSearch, FiClock, FiArrowRight, FiGrid, FiMenu } from 'react-icons/fi';
import { SiEpicgames, SiSteam } from 'react-icons/si';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';

interface HomeProps {
  epicFreeGames: ExtendedEpicGame[];
  epicUpcomingGames: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  steamTrendingGames: ExtendedEpicGame[];
  temporaryFreeGames: ExtendedEpicGame[];
}

type SortOption = 'title' | 'date';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export default function Home({ 
  epicFreeGames, 
  epicUpcomingGames, 
  steamFreeGames, 
  steamTrendingGames,
  temporaryFreeGames
}: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtreleme ve sıralama için state
  const [filterSource, setFilterSource] = useState<'all' | 'epic' | 'steam'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Filtrelenmiş oyun listeleri
  const [allGames, setAllGames] = useState<ExtendedEpicGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<ExtendedEpicGame[]>([]);
  
  // Tüm oyunları birleştir ve işaretle
  useEffect(() => {
    const epic = epicFreeGames.map(game => ({
      ...game,
      platform: 'epic' as const,
      isFree: true
    }));
    
    const upcoming = epicUpcomingGames.map(game => ({
      ...game,
      platform: 'epic' as const,
      isUpcoming: true
    }));
    
    const steam = steamFreeGames.map(game => ({
      ...game,
      platform: 'steam' as const,
      isFree: true
    }));
    
    const trending = steamTrendingGames.map(game => ({
      ...game,
      platform: 'steam' as const,
      isTrending: true
    }));

    const tempFree = temporaryFreeGames.map(game => ({
      ...game,
      platform: 'steam' as const,
      isTemporaryFree: true
    }));
    
    setAllGames([...epic, ...upcoming, ...steam, ...trending, ...tempFree]);
  }, [epicFreeGames, epicUpcomingGames, steamFreeGames, steamTrendingGames, temporaryFreeGames]);
  
  // Filtreleme ve sıralama işlemleri
  useEffect(() => {
    let filtered = [...allGames];
    
    // Platform filtresi
    if (filterSource !== 'all') {
      filtered = filtered.filter(game => game.platform === filterSource);
    }
    
    // Arama filtresi
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(query) || 
        (game.description && game.description.toLowerCase().includes(query))
      );
    }
    
    // Sıralama
    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'date') {
        let dateA, dateB;
        
        if (a.isUpcoming && a.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate) {
          dateA = new Date(a.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].startDate).getTime();
        } else {
          dateA = new Date(a.effectiveDate || 0).getTime();
        }
        
        if (b.isUpcoming && b.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate) {
          dateB = new Date(b.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].startDate).getTime();
        } else {
          dateB = new Date(b.effectiveDate || 0).getTime();
        }
        
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
    
    setFilteredGames(filtered);
  }, [allGames, filterSource, sortBy, sortDirection, searchQuery]);
  
  // Platform'a göre oyun sayısı
  const epicGamesCount = allGames.filter(game => game.platform === 'epic').length;
  const steamGamesCount = allGames.filter(game => game.platform === 'steam').length;
  const freeGamesCount = allGames.filter(game => game.isFree).length;
  const upcomingGamesCount = allGames.filter(game => game.isUpcoming).length;
  
  // Öne çıkan oyunları getir
  const featuredGames = allGames
    .filter(game => game.isFree && !game.isUpcoming)
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
  
  return (
    <Layout>
      <Head>
        <title>Ücretsiz Oyunlar | Epic ve Steam</title>
        <meta name="description" content="Epic Games ve Steam platformlarından ücretsiz oyunlar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Hero Slider */}
      {featuredGames.length > 0 && !isLoading && !error && (
        <section className="relative mb-12 overflow-hidden rounded-lg h-[60vh] min-h-[400px] max-h-[600px]">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop
            className="h-full w-full"
          >
            {featuredGames.map((game) => (
              <SwiperSlide key={game.id} className="relative h-full">
                {/* Arka plan görüntüsü */}
                <div className="absolute inset-0 bg-gray-900">
                  {game.keyImages?.find(img => img.type === "DieselStoreFrontWide" || img.type === "OfferImageWide") && (
                    <div className="absolute inset-0 opacity-60">
                      <img 
                        src={game.keyImages.find(img => img.type === "DieselStoreFrontWide" || img.type === "OfferImageWide")?.url} 
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                </div>
                
                {/* İçerik */}
                <div className="relative h-full w-full px-4 md:px-8 lg:px-16 flex flex-col justify-end pb-16">
                  <div className="max-w-4xl">
                    <div className="mb-2">
                      {game.platform === 'epic' ? (
                        <div className="flex items-center text-epicaccent mb-2">
                          <SiEpicgames className="mr-2" />
                          <span className="text-sm font-medium">Epic Games</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-blue-400 mb-2">
                          <SiSteam className="mr-2" />
                          <span className="text-sm font-medium">Steam</span>
                        </div>
                      )}
                      
                      {game.isFree && (
                        <span className="bg-epicblue text-white text-sm font-bold px-3 py-1 rounded-full">
                          ÜCRETSİZ
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{game.title}</h2>
                    <p className="text-gray-300 text-lg mb-6 line-clamp-2 max-w-3xl">
                      {game.description || "Bu oyun hakkında açıklama bulunmuyor."}
                    </p>
                    
                    <Link 
                      href={`/game/${game.id}`}
                      className="inline-flex items-center bg-white hover:bg-gray-100 text-gray-900 font-medium px-5 py-2.5 rounded-lg transition-colors"
                    >
                      Detaylara Bak
                      <FiArrowRight className="ml-2" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* İstatistik Kartları */}
      <section className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
            <FiGrid className="text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{allGames.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Oyun</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 bg-epicblue/10 dark:bg-epicblue/20 rounded-lg flex items-center justify-center mr-3">
            <SiEpicgames className="text-epicblue dark:text-epicaccent" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{epicGamesCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Epic Games</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
            <SiSteam className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{steamGamesCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Steam</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
            <FiClock className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingGamesCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Yakında Ücretsiz</div>
          </div>
        </div>
      </section>

      {/* Filtreleme ve Arama */}
      <section className="mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Arama */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Oyun ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-epicblue dark:focus:ring-epicaccent"
              />
            </div>
            
            {/* Platform Filter */}
            <div className="flex-shrink-0 flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Platform:</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as any)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-epicblue dark:focus:ring-epicaccent"
              >
                <option value="all">Tümü</option>
                <option value="epic">Epic Games</option>
                <option value="steam">Steam</option>
              </select>
            </div>
            
            {/* Sıralama */}
            <div className="flex-shrink-0 flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Sırala:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-epicblue dark:focus:ring-epicaccent"
              >
                <option value="title">İsim</option>
                <option value="date">Tarih</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
              </button>
            </div>
            
            {/* Görünüm Modu */}
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' 
                    ? 'bg-epicblue text-white' 
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400'}`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' 
                    ? 'bg-epicblue text-white' 
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400'}`}
                >
                  <FiMenu />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Oyun Listesi */}
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-10 text-red-700 dark:text-red-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center mb-10 border border-gray-100 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sonuç Bulunamadı</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Aramanıza veya filtrelerinize uygun oyun bulunamadı. Lütfen arama terimlerinizi değiştirin veya filtreleri sıfırlayın.
            </p>
          </div>
        </div>
      ) : (
        <section className="mb-10">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGames.map(game => (
                <div key={game.id} className="h-full">
                  <GameCard 
                    game={game} 
                    isFree={game.isFree} 
                    isUpcoming={game.isUpcoming} 
                    isTrending={game.isTrending} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGames.map(game => (
                <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 lg:w-1/5 relative">
                      {game.keyImages?.find(img => img.type === "Thumbnail" || img.type === "OfferImageTall") && (
                        <img 
                          src={game.keyImages.find(img => img.type === "Thumbnail" || img.type === "OfferImageTall")?.url} 
                          alt={game.title}
                          className="w-full h-full object-cover aspect-[3/4] md:aspect-auto"
                        />
                      )}
                      
                      {game.isFree && (
                        <div className="absolute top-2 left-2 bg-epicblue text-white text-xs font-bold px-2 py-1 rounded">
                          ÜCRETSİZ
                        </div>
                      )}
                      
                      {game.isUpcoming && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                          YAKINDA
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {game.title}
                        </h3>
                        
                        {game.platform === 'epic' ? (
                          <SiEpicgames className="text-epicblue dark:text-epicaccent" />
                        ) : (
                          <SiSteam className="text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {game.description || "Bu oyun hakkında açıklama bulunmuyor."}
                      </p>
                      
                      <div className="mt-auto flex justify-end">
                        <Link 
                          href={`/game/${game.id}`}
                          className="inline-flex items-center text-epicblue dark:text-epicaccent hover:underline text-sm"
                        >
                          Detaylara Bak
                          <FiArrowRight className="ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      
      {/* Platform Tanıtım Kartları */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Epic Games Kutusu */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="h-16 bg-gradient-to-r from-epicblue to-epicpurple"></div>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-epicblue/10 dark:bg-epicblue/20 rounded-lg flex items-center justify-center mr-3">
                <SiEpicgames className="text-epicblue dark:text-epicaccent text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Epic Games</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Epic Games Store, her hafta yeni ücretsiz oyunlar sunuyor. Bu sitede, mevcut ücretsiz oyunları ve gelecekte ücretsiz olacak oyunları takip edebilirsiniz.
            </p>
            <a
              href="https://store.epicgames.com/tr/free-games"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-epicblue dark:text-epicaccent hover:underline"
            >
              <span>Epic Games Store'u ziyaret et</span>
              <FiArrowRight className="ml-1" />
            </a>
          </div>
        </div>
        
        {/* Steam Kutusu */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="h-16 bg-gradient-to-r from-gray-700 to-gray-900"></div>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                <SiSteam className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Steam</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Steam'de her zaman oynayabileceğiniz ücretsiz oyunlar ve dönemsel olarak ücretsiz hale gelen oyunlar bulunmaktadır. Fırsatları kaçırmamak için takipte kalın!
            </p>
            <a
              href="https://store.steampowered.com/genre/Free%20to%20Play/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Steam Store'u ziyaret et</span>
              <FiArrowRight className="ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Sınırlı Süre Ücretsiz Oyunlar */}
      {temporaryFreeGames.length > 0 && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="bg-purple-200 dark:bg-purple-900 text-purple-700 dark:text-purple-300 p-2 rounded-lg mr-3">
                <FiClock />
              </span>
              Sınırlı Süre Ücretsiz Oyunlar
            </h2>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Kaçırmayın - Sınırlı süre için ücretsiz!
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {temporaryFreeGames.map(game => (
              <div key={game.id} className="h-full">
                <GameCard 
                  game={game} 
                  temporaryFreeGame={true}
                  isFree={true}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    // Paralel olarak tüm API isteklerini yapıyoruz
    const [epicFreeGamesData, epicUpcomingGamesData, steamFreeGamesData, steamTrendingGamesData, temporaryFreeGamesData] = await Promise.all([
      getFreeGames(),
      getUpcomingFreeGames(),
      getFreeSteamGames().then(games => games.map(convertSteamToEpicFormat)),
      getTrendingSteamGames().then(games => games.map(convertSteamToEpicFormat)),
      getTemporaryFreeSteamGames().then(games => games.map(convertSteamToEpicFormat))
    ]);

    // Tüm verileri bir araya getiriyoruz
    return {
      props: {
        epicFreeGames: epicFreeGamesData as ExtendedEpicGame[],
        epicUpcomingGames: epicUpcomingGamesData as ExtendedEpicGame[],
        steamFreeGames: steamFreeGamesData as ExtendedEpicGame[],
        steamTrendingGames: steamTrendingGamesData as ExtendedEpicGame[],
        temporaryFreeGames: temporaryFreeGamesData as ExtendedEpicGame[]
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
        temporaryFreeGames: [] as ExtendedEpicGame[]
      },
      revalidate: 300, // Hata durumunda 5 dakika sonra tekrar dene
    };
  }
}; 