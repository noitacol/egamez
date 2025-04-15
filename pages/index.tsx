import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { EpicGame, getFreeGames } from '../lib/epic-api';

interface HomeProps {
  freeGames: EpicGame[];
}

export default function Home({ freeGames }: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  return (
    <Layout>
      <div className="mb-12">
        <h1 className="section-title text-4xl md:text-5xl font-bold mb-4">
          <span className="highlight">Ücretsiz Oyunlar</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
          Epic Games Store'da şu anda ücretsiz olarak sunulan oyunları keşfedin. Her hafta yeni ücretsiz oyunlar ekleniyor - hemen kütüphanenize ekleyin!
        </p>
      </div>

      {/* Site aktivitesini göster */}
      <div className="bg-gradient-to-r from-epicblue/10 to-epicaccent/10 dark:from-epicblue/20 dark:to-epicaccent/20 mb-10 py-6 px-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent">
              {freeGames.length}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
              Ücretsiz Oyun
            </div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent">
              Her gün
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
              Güncelleme
            </div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-epicblue dark:text-epicaccent">
              100%
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
              Ücretsiz
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
      
      {freeGames.length === 0 && !isLoading && !error ? (
        <div className="glass-card p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Şu anda ücretsiz oyun bulunmuyor.
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Daha sonra tekrar kontrol edin veya yakında ücretsiz olacak oyunlara göz atın.
          </p>
        </div>
      ) : (
        <div>
          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" 
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${freeGames.length === 1 ? '100%' : freeGames.length === 2 ? '45%' : freeGames.length === 3 ? '30%' : '260px'}, 1fr))`
              }}>
              {freeGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Yakında Ücretsiz Olacak Oyunlar için çağrı */}
      <div className="mt-16">
        <div className="glass-card p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-epicaccent/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-epicblue/10 rounded-full -ml-10 -mb-10"></div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-4">Diğer Ücretsiz Oyunları Kaçırmayın!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Epic Games Store, her hafta yeni ücretsiz oyunlar sunuyor. Yakında ücretsiz olacak oyunları görmek ve fırsatları kaçırmak için takipte kalın.
            </p>
            <a
              href="/upcoming"
              className="btn btn-accent inline-flex items-center"
            >
              <span>Yakında Ücretsiz</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const freeGames = await getFreeGames();
    
    return {
      props: {
        freeGames,
      },
      // Her 30 dakikada bir yeniden oluştur
      revalidate: 1800,
    };
  } catch (error) {
    console.error('Error fetching free games:', error);
    return {
      props: {
        freeGames: [],
      },
      // Hata durumunda 5 dakikada bir yeniden dene
      revalidate: 300,
    };
  }
}; 