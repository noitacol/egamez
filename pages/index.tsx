import { useState, useEffect } from 'react';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard, { ExtendedEpicGame } from '../components/GameCard';
import GameSlider from '../components/GameSlider';
import { getFreeGames, getUpcomingFreeGames, EpicGame, getTrendingEpicGames, getTemporaryFreeEpicGames } from '../lib/epic-api';
import { getFreeSteamGames, getTrendingSteamGames, convertSteamToEpicFormat, getTemporaryFreeSteamGames } from '../lib/steam-api';
import { FiFilter, FiBarChart2, FiArrowUp, FiArrowDown, FiGift, FiCalendar, FiTrendingUp, FiClock, FiAlertCircle } from 'react-icons/fi';
import { SiEpicgames, SiSteam } from 'react-icons/si';
import { BiTimer } from 'react-icons/bi';
import { MdOutlineTimer } from 'react-icons/md';
import { FaHourglassHalf } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { FaSort, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa';
import { BsFillGridFill, BsList } from 'react-icons/bs';
import { HiOutlineFilter } from 'react-icons/hi';

type SortOption = 'title' | 'date';
type SortDirection = 'asc' | 'desc';
type FilterSource = 'all' | 'epic' | 'steam';

interface HomeProps {
  epicFreeGames: EpicGame[];
  steamFreeGames: EpicGame[];
  upcomingGames: EpicGame[];
  trendingGames: EpicGame[];
  temporaryFreeGames: EpicGame[];
  error?: string;
}

const Home: NextPage<HomeProps> = ({ epicFreeGames, steamFreeGames, upcomingGames, trendingGames, temporaryFreeGames }) => {
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
        {/* Sınırlı Süreli Ücretsiz Oyunlar Banner */}
        {temporaryFreeGames.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2 p-2 rounded-lg text-white bg-gradient-to-r from-amber-500 to-red-500">
                <FaHourglassHalf size={20} />
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-red-500">
                Sınırlı Süre Ücretsiz
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {temporaryFreeGames.map((game, index) => {
                // Kalan süreyi hesapla
                const now = new Date();
                let remainingDays = 0;
                
                if (game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0]) {
                  const endDate = new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate);
                  remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                }
                
                // Oyun görselini bul
                const coverImage = game.keyImages?.find(img => img.type === 'DieselStoreFrontWide')?.url || 
                                  game.keyImages?.find(img => img.type === 'OfferImageWide')?.url ||
                                  game.keyImages?.find(img => img.type === 'Thumbnail')?.url;
                
                // İlk öğe için farklı bir düzen kullan
                if (index === 0 && temporaryFreeGames.length >= 3) {
                  return (
                    <div key={game.id} className="col-span-1 md:col-span-2 lg:col-span-2 rounded-xl overflow-hidden bg-gradient-to-r from-amber-500/10 to-red-500/10 dark:from-amber-900/30 dark:to-red-900/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 to-red-500/40 dark:from-amber-900/50 dark:to-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="flex flex-col md:flex-row h-full">
                        {/* Görsel alanı */}
                        <div className="md:w-2/3 relative h-52 md:h-auto overflow-hidden">
                          {coverImage && (
                            <Image
                              src={coverImage}
                              alt={game.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 66vw"
                              className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                              unoptimized={game.source === 'steam'}
                              priority
                            />
                          )}
                          
                          {/* Kaynak bilgisi */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className={`flex items-center gap-1 ${game.source === 'epic' ? 'bg-epicblack' : 'bg-[#1b2838]'} text-white px-2 py-1 rounded-md text-xs font-medium`}>
                              {game.source === 'epic' ? <SiEpicgames className="mr-1" /> : <SiSteam className="mr-1" />}
                              {game.source === 'epic' ? 'Epic Games' : 'Steam'}
                            </span>
                          </div>
                          
                          {/* Kalan süre öne çıkar */}
                          <div className="absolute top-3 right-3 z-10">
                            <span className="flex items-center gap-1 bg-amber-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                              <FiClock className="mr-1" />
                              {remainingDays} gün kaldı
                            </span>
                          </div>
                        </div>
                        
                        {/* Bilgi alanı */}
                        <div className="md:w-1/3 p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {game.title}
                            </h3>
                            
                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                              {game.description || "Açıklama bulunmuyor."}
                            </p>
                            
                            <div className="mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-green-600 dark:text-green-400 font-bold">Ücretsiz</span>
                                <span className="line-through text-gray-500">
                                  {game.price?.totalPrice?.originalPrice ? `${(game.price.totalPrice.originalPrice / 100).toFixed(2)} TL` : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Link href={`/game/${game.id}${game.source ? `?source=${game.source}` : ''}`}>
                            <span className="inline-block py-2 px-4 bg-gradient-to-r from-amber-500 to-red-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-red-600 transition-all duration-300 text-center">
                              Hemen Al
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Diğer kartlar için standart görünüm
                return (
                  <div key={game.id} className="relative rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group">
                    {/* Görsel */}
                    <div className="relative h-48 overflow-hidden">
                      {coverImage && (
                        <Image
                          src={coverImage}
                          alt={game.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                          unoptimized={game.source === 'steam'}
                        />
                      )}
                      
                      {/* Kaynak bilgisi */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`flex items-center gap-1 ${game.source === 'epic' ? 'bg-epicblack' : 'bg-[#1b2838]'} text-white px-2 py-1 rounded-md text-xs font-medium`}>
                          {game.source === 'epic' ? 'Epic' : 'Steam'}
                        </span>
                      </div>
                      
                      {/* Kalan süre */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="flex items-center gap-1 bg-amber-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                          <FiClock size={12} />
                          {remainingDays} gün kaldı
                        </span>
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    </div>
                    
                    {/* İçerik */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {game.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {game.description || "Açıklama bulunmuyor."}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400 font-medium">Ücretsiz</span>
                          <span className="line-through text-gray-500 text-sm">
                            {game.price?.totalPrice?.originalPrice ? `${(game.price.totalPrice.originalPrice / 100).toFixed(2)} TL` : ''}
                          </span>
                        </div>
                        
                        <Link href={`/game/${game.id}${game.source ? `?source=${game.source}` : ''}`}>
                          <span className="text-sm text-amber-600 dark:text-amber-400 hover:underline flex items-center">
                            Detaylar
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

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
            games={upcomingGames as ExtendedEpicGame[]} 
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
    // API'den free, upcoming, trending ve sınırlı süreli ücretsiz oyunları getir
    const [epicFreeGames, steamFreeGames, upcomingGames, epicTrending, steamTrending, tempFreeEpic, tempFreeSteam] = await Promise.all([
      getFreeGames(),
      getFreeSteamGames(),
      getUpcomingFreeGames(),
      getTrendingEpicGames(),
      getTrendingSteamGames(),
      getTemporaryFreeEpicGames(),
      getTemporaryFreeSteamGames(),
    ]);

    // Epic ve Steam'den sınırlı süreli ücretsiz oyunları birleştir
    const temporaryFreeGames = [
      ...tempFreeEpic.map(game => ({ ...game, source: 'epic' })),
      ...tempFreeSteam.map(game => ({ ...game, source: 'steam' }))
    ];

    return {
      props: {
        epicFreeGames,
        steamFreeGames,
        upcomingGames,
        trendingGames: [...epicTrending, ...steamTrending],
        temporaryFreeGames,
      },
      // 1 saatte bir yeniden oluştur
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        epicFreeGames: [],
        steamFreeGames: [],
        upcomingGames: [],
        trendingGames: [],
        temporaryFreeGames: [],
        error: 'Veri çekilirken bir hata oluştu'
      },
      revalidate: 60 // Hata durumunda 1 dakika sonra tekrar dene
    };
  }
};

export default Home; 