import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { getUpcomingFreeGames } from '../lib/epic-api';
import { EpicGame } from '../lib/epic-api';

interface UpcomingPageProps {
  upcomingGames: EpicGame[];
}

export default function UpcomingPage({ upcomingGames }: UpcomingPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Layout>
      <Head>
        <title>Yakında Ücretsiz Olacak Oyunlar | EpicAPI</title>
        <meta name="description" content="Epic Games Store'da yakında ücretsiz olacak oyunları keşfedin" />
      </Head>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Yakında Ücretsiz Olacak Oyunlar
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Epic Games Store'da yakında ücretsiz olacak oyunları keşfedin.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {upcomingGames && upcomingGames.map((game) => (
          <GameCard key={game.id} game={game} isUpcoming={true} />
        ))}
        
        {upcomingGames && upcomingGames.length === 0 && !loading && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">Şu anda yakında ücretsiz olacak oyun bulunmuyor.</p>
          </div>
        )}
      </div>
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
      revalidate: 3600, // 1 saat
    };
  } catch (error) {
    console.error('Upcoming games fetching error:', error);
    
    return {
      props: {
        upcomingGames: [],
      },
      revalidate: 60, // Hata durumunda 1 dakika sonra tekrar dene
    };
  }
}; 