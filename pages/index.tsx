import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { EpicGame, getFreeGames, getUpcomingFreeGames } from '../lib/epic-api';
import { SteamGame, getFreeSteamGames, convertSteamToEpicFormat } from '../lib/steam-api';

interface HomeProps {
  epicFreeGames: EpicGame[];
  epicUpcomingGames: EpicGame[];
  steamFreeGames: EpicGame[]; // Steam oyunları Epic formatına dönüştürülüyor
}

export default function Home({ epicFreeGames, epicUpcomingGames, steamFreeGames }: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tüm oyunlar (epic + steam)
  const totalGames = epicFreeGames.length + epicUpcomingGames.length + steamFreeGames.length;
  
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
        <h1 className="section-title text-4xl md:text-5xl font-bold mb-4">
          <span className="highlight">Ücretsiz Oyunlar</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
          Epic Games ve Steam'de şu anda ücretsiz olarak sunulan oyunları keşfedin. Hemen kütüphanenize ekleyin!
        </p>
      </div>

      {/* Site aktivitesini göster */}
      <div className="bg-gradient-to-r from-epicblue/10 to-epicaccent/10 dark:from-epicblue/20 dark:to-epicaccent/20 mb-10 py-6 px-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent">
              {totalGames}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
              Toplam Oyun
            </div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent">
              {epicFreeGames.length}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
              Epic Games
            </div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent">
              {steamFreeGames.length}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
              Steam
            </div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent">
              {epicUpcomingGames.length}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
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
      
      {/* Epic Games Ücretsiz Oyunlar Bölümü */}
      {epicFreeGames.length > 0 && !isLoading && !error ? (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="highlight">Epic Games'te Ücretsiz</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" 
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${getGridWidth(epicFreeGames.length)}, 1fr))`
            }}>
            {epicFreeGames.map((game) => (
              <GameCard key={game.id} game={game} isFree={true} />
            ))}
          </div>
        </div>
      ) : !isLoading && !error && (
        <div className="glass-card p-8 text-center mb-16">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Epic Games'te şu anda ücretsiz oyun bulunmuyor.
          </p>
        </div>
      )}
      
      {/* Steam Ücretsiz Oyunlar Bölümü */}
      {steamFreeGames.length > 0 && !isLoading && !error ? (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="highlight">Steam'de Ücretsiz</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" 
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${getGridWidth(steamFreeGames.length)}, 1fr))`
            }}>
            {steamFreeGames.map((game) => (
              <GameCard key={game.id} game={game} isFree={true} />
            ))}
          </div>
        </div>
      ) : !isLoading && !error && (
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
      {epicUpcomingGames.length > 0 && !isLoading && !error && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            <span className="highlight">Yakında Ücretsiz Olacak</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" 
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${getGridWidth(epicUpcomingGames.length)}, 1fr))`
            }}>
            {epicUpcomingGames.map((game) => (
              <GameCard key={game.id} game={game} isUpcoming={true} />
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

export const getStaticProps: GetStaticProps = async () => {
  try {
    const [epicFreeGames, epicUpcomingGames, steamGames] = await Promise.all([
      getFreeGames(),
      getUpcomingFreeGames(),
      getFreeSteamGames() // Steam'deki ücretsiz oyunları getir
    ]);
    
    // Steam oyunlarını Epic Games formatına dönüştür
    const steamFreeGames = steamGames.map(game => convertSteamToEpicFormat(game));
    
    return {
      props: {
        epicFreeGames,
        epicUpcomingGames,
        steamFreeGames
      },
      // Her 30 dakikada bir yeniden oluştur
      revalidate: 1800,
    };
  } catch (error) {
    console.error('Error fetching games:', error);
    return {
      props: {
        epicFreeGames: [],
        epicUpcomingGames: [],
        steamFreeGames: []
      },
      // Hata durumunda 5 dakikada bir yeniden dene
      revalidate: 300,
    };
  }
}; 