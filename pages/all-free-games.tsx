import { useState } from 'react';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { getFreeGames, getUpcomingFreeGames } from '../lib/epic-api';
import { getFreeSteamGames, getTrendingSteamGames, convertSteamToEpicFormat, getTemporaryFreeSteamGames } from '../lib/steam-api';
import { ExtendedEpicGame } from '../lib/types';
import { FiFilter, FiGrid, FiList, FiSearch, FiX } from 'react-icons/fi';
import { SiEpicgames, SiSteam } from 'react-icons/si';

interface AllFreeGamesProps {
  epicFreeGames: ExtendedEpicGame[];
  epicUpcomingGames: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  temporaryFreeGames: ExtendedEpicGame[];
}

export default function AllFreeGames({ 
  epicFreeGames, 
  epicUpcomingGames, 
  steamFreeGames,
  temporaryFreeGames 
}: AllFreeGamesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'epic' | 'steam'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'permanent' | 'temporary' | 'upcoming'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Tüm oyunları birleştir
  const allGames = [
    ...epicFreeGames.map(game => ({...game, platform: 'epic' as const})),
    ...epicUpcomingGames.map(game => ({...game, platform: 'epic' as const, isUpcoming: true})),
    ...steamFreeGames.map(game => ({...game, platform: 'steam' as const})),
    ...temporaryFreeGames.map(game => ({...game, platform: 'steam' as const, temporaryFreeGame: true})),
  ];
  
  // Filtreleme fonksiyonu
  const filteredGames = allGames.filter(game => {
    // Arama terimi filtresi
    if (searchTerm && !game.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Platform filtresi
    if (platformFilter !== 'all' && game.platform !== platformFilter) {
      return false;
    }
    
    // Tür filtresi
    if (typeFilter === 'permanent') {
      if (game.isUpcoming || game.temporaryFreeGame) return false;
    } else if (typeFilter === 'temporary') {
      if (!game.temporaryFreeGame) return false;
    } else if (typeFilter === 'upcoming') {
      if (!game.isUpcoming) return false;
    }
    
    return true;
  });
  
  // Sıralama: Önce geçici ücretsiz, sonra yakında ücretsiz, en son kalıcı ücretsiz
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (a.temporaryFreeGame && !b.temporaryFreeGame) return -1;
    if (!a.temporaryFreeGame && b.temporaryFreeGame) return 1;
    if (a.isUpcoming && !b.isUpcoming) return -1;
    if (!a.isUpcoming && b.isUpcoming) return 1;
    return 0;
  });

  return (
    <Layout>
      <Head>
        <title>Tüm Ücretsiz Oyunlar | EpicAPI</title>
        <meta name="description" content="Epic Games Store ve Steam'deki tüm ücretsiz oyunları keşfedin." />
      </Head>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tüm Ücretsiz Oyunlar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Epic Games ve Steam'deki ücretsiz oyunları keşfedin. Kalıcı ücretsiz, geçici ücretsiz ve yakında ücretsiz olacak oyunları görüntüleyin.
        </p>
      </div>

      {/* Filtreler ve Arama */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Arama */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Oyun ara..."
              className="pl-10 w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FiX className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              </button>
            )}
          </div>
          
          {/* Platform Filtresi */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Platform:</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1.5 text-sm ${
                  platformFilter === 'all'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setPlatformFilter('epic')}
                className={`px-3 py-1.5 text-sm flex items-center ${
                  platformFilter === 'epic'
                    ? 'bg-epicblue text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <SiEpicgames className="mr-1" />
                Epic
              </button>
              <button
                onClick={() => setPlatformFilter('steam')}
                className={`px-3 py-1.5 text-sm flex items-center ${
                  platformFilter === 'steam'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <SiSteam className="mr-1" />
                Steam
              </button>
            </div>
          </div>
          
          {/* Tür Filtresi */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Tür:</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 text-sm ${
                  typeFilter === 'all'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setTypeFilter('permanent')}
                className={`px-3 py-1.5 text-sm ${
                  typeFilter === 'permanent'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Kalıcı
              </button>
              <button
                onClick={() => setTypeFilter('temporary')}
                className={`px-3 py-1.5 text-sm ${
                  typeFilter === 'temporary'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Geçici
              </button>
              <button
                onClick={() => setTypeFilter('upcoming')}
                className={`px-3 py-1.5 text-sm ${
                  typeFilter === 'upcoming'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Yakında
              </button>
            </div>
          </div>
          
          {/* Görünüm Modu */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-label="Grid view"
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-label="List view"
            >
              <FiList />
            </button>
          </div>
        </div>
        
        {/* Filtre özeti */}
        <div className="mt-3 flex flex-wrap gap-2">
          {(platformFilter !== 'all' || typeFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setPlatformFilter('all');
                setTypeFilter('all');
                setSearchTerm('');
              }}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded-full flex items-center hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <FiX className="mr-1" /> Filtreleri temizle
            </button>
          )}
          
          {platformFilter !== 'all' && (
            <div className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded-full flex items-center">
              Platform: {platformFilter === 'epic' ? 'Epic Games' : 'Steam'}
              <button 
                onClick={() => setPlatformFilter('all')} 
                className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <FiX />
              </button>
            </div>
          )}
          
          {typeFilter !== 'all' && (
            <div className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded-full flex items-center">
              Tür: {
                typeFilter === 'permanent' ? 'Kalıcı Ücretsiz' : 
                typeFilter === 'temporary' ? 'Geçici Ücretsiz' : 'Yakında Ücretsiz'
              }
              <button 
                onClick={() => setTypeFilter('all')} 
                className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <FiX />
              </button>
            </div>
          )}
          
          {searchTerm && (
            <div className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded-full flex items-center">
              Arama: {searchTerm}
              <button 
                onClick={() => setSearchTerm('')} 
                className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <FiX />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sonuç özeti */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        <span>{sortedGames.length} oyun bulundu</span>
      </div>

      {/* Oyun Listesi */}
      {sortedGames.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-100 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sonuç bulunamadı</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Arama kriterlerinize uygun ücretsiz oyun bulunamadı. Farklı filtreler deneyebilir veya arama terimini değiştirebilirsiniz.
            </p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedGames.map(game => (
                <div key={game.id} className="h-full">
                  <GameCard 
                    game={game} 
                    temporaryFreeGame={game.temporaryFreeGame}
                    isUpcoming={game.isUpcoming}
                    isFree={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedGames.map(game => (
                <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-auto">
                      {game.keyImages?.find(img => img.type === "OfferImageTall") ? (
                        <img
                          src={game.keyImages.find(img => img.type === "OfferImageTall")?.url}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900"></div>
                      )}
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex space-x-2 mb-2">
                            {game.platform === 'epic' ? (
                              <div className="bg-epicblue/90 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                                <SiEpicgames className="mr-1" size={10} />
                                Epic Games
                              </div>
                            ) : (
                              <div className="bg-gray-700/90 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                                <SiSteam className="mr-1" size={10} />
                                Steam
                              </div>
                            )}
                            
                            {game.temporaryFreeGame && (
                              <div className="bg-purple-600/90 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                                Sınırlı Süre
                              </div>
                            )}
                            
                            {game.isUpcoming && (
                              <div className="bg-orange-500/90 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                                Yakında
                              </div>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {game.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                            {game.description || "Bu oyun hakkında açıklama bulunmuyor."}
                          </p>
                        </div>
                        <div className="text-right">
                          {game.price?.totalPrice?.discountPrice === 0 ? (
                            <div className="text-green-600 dark:text-green-400 font-semibold">Ücretsiz</div>
                          ) : (
                            <div className="text-gray-600 dark:text-gray-400">
                              {game.price?.totalPrice?.originalPrice 
                                ? `₺${(game.price.totalPrice.originalPrice / 100).toFixed(2)}`
                                : 'Ücretsiz'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<AllFreeGamesProps> = async () => {
  try {
    // Paralel olarak tüm API isteklerini yapıyoruz
    const [epicFreeGamesData, epicUpcomingGamesData, steamFreeGamesData, temporaryFreeGamesData] = await Promise.all([
      getFreeGames(),
      getUpcomingFreeGames(),
      getFreeSteamGames().then(games => games.map(convertSteamToEpicFormat)),
      getTemporaryFreeSteamGames().then(games => games.map(convertSteamToEpicFormat))
    ]);

    // Tüm verileri bir araya getiriyoruz
    return {
      props: {
        epicFreeGames: epicFreeGamesData as ExtendedEpicGame[],
        epicUpcomingGames: epicUpcomingGamesData as ExtendedEpicGame[],
        steamFreeGames: steamFreeGamesData as ExtendedEpicGame[],
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
        temporaryFreeGames: [] as ExtendedEpicGame[]
      },
      revalidate: 300, // Hata durumunda 5 dakika sonra tekrar dene
    };
  }
}; 