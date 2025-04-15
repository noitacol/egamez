import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { EpicGame, getFreeGames, getUpcomingFreeGames } from '../lib/epic-api';
import Link from 'next/link';

const Home: NextPage = () => {
  const [freeGames, setFreeGames] = useState<EpicGame[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<EpicGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        // Mevcut ve yakında ücretsiz olacak oyunları çek
        const [currentFreeGames, upcomingFreeGames] = await Promise.all([
          getFreeGames(),
          getUpcomingFreeGames()
        ]);
        
        setFreeGames(currentFreeGames);
        setUpcomingGames(upcomingFreeGames);
        setError('');
      } catch (err) {
        console.error('Oyunlar yüklenirken hata oluştu:', err);
        setError('Oyunlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        <section>
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-epicblue to-epicaccent dark:from-epicgreen dark:to-epicaccent text-transparent bg-clip-text">
              Ücretsiz Oyunlar
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Epic Games Store&apos;dan şu anda ücretsiz alabileceğiniz oyunları keşfedin. Sınırlı bir süre için tamamen ücretsiz!
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center my-20">
              <div className="animate-spin w-12 h-12 border-4 border-epicblue/20 border-t-epicblue rounded-full"></div>
            </div>
          ) : error ? (
            <div className="my-20 bg-red-50 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-lg p-6 text-center max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-medium mt-3 text-red-800 dark:text-red-200">Hata Oluştu</h2>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-epicblue text-white rounded-md hover:bg-epicblue/90 transition-colors"
                onClick={() => window.location.reload()}
              >
                Yeniden Dene
              </button>
            </div>
          ) : (
            <>
              {freeGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freeGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="my-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h2 className="text-xl font-medium mt-3">Şu anda ücretsiz oyun yok</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Şu anda Epic Games Store'da ücretsiz oyun bulunmuyor. Daha sonra tekrar kontrol edin.</p>
                </div>
              )}
              
              {/* Yakında Ücretsiz Oyunlar Bölümü */}
              {upcomingGames.length > 0 && (
                <section className="mt-16">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold relative pl-4 border-l-4 border-epicaccent">
                      <span className="bg-gradient-to-r from-epicaccent to-epicorange text-transparent bg-clip-text">
                        Yakında Ücretsiz Olacak
                      </span>
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
          
          {/* Site Aktivite İstatistikleri */}
          <div className="mt-16 mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-epicblue/5 to-epicaccent/5 dark:from-epicblue/10 dark:to-epicaccent/10 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-epicblue dark:text-epicaccent">
                    {freeGames.length + upcomingGames.length}+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ücretsiz Oyun
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-epicgreen">Günlük</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Güncelleme
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-epicaccent to-epicorange text-transparent bg-clip-text">
                    %100
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ücretsiz
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Home; 