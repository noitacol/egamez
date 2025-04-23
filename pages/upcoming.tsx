import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { ExtendedEpicGame } from '../lib/types';
import { getGamerPowerBetaAsEpicFormat } from "@/lib/gamerpower-api";

export default function UpcomingGames() {
  const [games, setGames] = useState<ExtendedEpicGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // API'den oyunları getirme işlemi
    const fetchGames = async () => {
      try {
        setLoading(true);
        
        // Epic Games API devre dışı bırakıldığı için yerel veri kullanıyoruz
        // Gerçek bir API çağrısı yerine statik veri ya da başka bir kaynak kullanın
        setGames([]);
        setLoading(false);
      } catch (err) {
        console.error('Yakında çıkacak oyunlar yüklenirken hata oluştu:', err);
        setError('Oyunlar yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <Layout title="Yakında Çıkacak Ücretsiz Oyunlar">
      <Head>
        <meta name="description" content="Yakında ücretsiz olacak oyunları keşfedin" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-purple-500 inline-block">
          Yakında Çıkacak Ücretsiz Oyunlar
        </h1>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-lg">
            {error}
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} isUpcoming={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Şu anda yakında çıkacak ücretsiz oyun bilgisi bulunmuyor. Lütfen daha sonra tekrar kontrol edin.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Şu anda Epic API devre dışı olduğu için getStaticProps kullanmıyoruz
// Sayfa tamamen client-side veri alacak veya boş görünecek
export async function getStaticProps() {
  try {
    // Burada API çağrısı yerine boş bir veri döndür
    return {
      props: {
        upcomingGames: [],
      },
      // Her 6 saatte bir yeniden oluştur
      revalidate: 21600,
    };
  } catch (error) {
    console.error('getStaticProps error:', error);
    return {
      props: {
        upcomingGames: [],
      },
      revalidate: 3600,
    };
  }
} 