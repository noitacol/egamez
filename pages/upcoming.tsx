import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import axios from 'axios';
import UpcomingGames from '@/components/UpcomingGames';
import { EpicGame } from '@/lib/types';
import { Container } from '@/components/Container';

interface UpcomingProps {
  upcomingGames: EpicGame[];
}

const Upcoming = ({ upcomingGames }: UpcomingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>Yakında Ücretsiz Olacak Oyunlar | FRPG Gaming</title>
        <meta name="description" content="Epic Games Store'da yakında ücretsiz olacak oyunların listesi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-10">
        <Container>
          <h1 className="text-3xl font-bold mb-8">Yakında Ücretsiz Olacak Oyunlar</h1>
          {isLoading ? (
            <p>Yükleniyor...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <UpcomingGames upcomingGames={upcomingGames} />
          )}
        </Container>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    const API_URL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api/upcoming-games'
      : 'https://epicapi.vercel.app/api/upcoming-games';
    
    const response = await axios.get(API_URL);
    const upcomingGames = response.data;

    return {
      props: {
        upcomingGames,
      },
      revalidate: 3600, // 1 saat
    };
  } catch (error) {
    console.error('getStaticProps error:', error);
    return {
      props: {
        upcomingGames: [],
      },
      revalidate: 1800, // 30 dakika
    };
  }
};

export default Upcoming; 