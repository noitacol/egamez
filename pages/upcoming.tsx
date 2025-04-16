import { useState } from 'react';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { getUpcomingFreeGames } from '../lib/epic-api';
import { ExtendedEpicGame } from '../components/GameCard';

interface UpcomingProps {
  upcomingGames: ExtendedEpicGame[];
}

export default function Upcoming({ upcomingGames }: UpcomingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  return (
    <Layout
      title="Yakında Ücretsiz Olacak Oyunlar | Epic Games"
      description="Epic Games Store'da yakında ücretsiz olacak oyunları keşfedin."
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Yakında Ücretsiz Olacak Oyunlar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Epic Games Store'da yakında ücretsiz olarak sunulacak oyunlar.
        </p>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-epicblue border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {upcomingGames.length === 0 && !isLoading && !error ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Yakında ücretsiz olacak oyun bilgisi bulunamadı. Daha sonra tekrar kontrol edin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {upcomingGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const upcomingGames = await getUpcomingFreeGames();
    
    return {
      props: {
        upcomingGames,
      },
      // Her 30 dakikada bir yeniden oluştur
      revalidate: 1800,
    };
  } catch (error) {
    console.error('Error fetching upcoming free games:', error);
    return {
      props: {
        upcomingGames: [],
      },
      // Hata durumunda 5 dakikada bir yeniden dene
      revalidate: 300,
    };
  }
}; 