import { GetStaticProps } from "next";
import { useState } from "react";
import Head from "next/head";
import { getFreeGames, getUpcomingFreeGames } from "@/lib/epic-api";
import { getFreeSteamGames } from "@/lib/steam-api";
import FreeGamesList from "@/components/FreeGamesList";
import GameCard from "@/components/GameCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtendedEpicGame } from "@/lib/types";

interface HomeProps {
  epicFreeGames: ExtendedEpicGame[];
  upcomingEpicGames: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  totalGames: number;
}

export default function Home({ 
  epicFreeGames, 
  upcomingEpicGames, 
  steamFreeGames,
  totalGames 
}: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>EpicAPI - Epic Games ve Steam'deki Ücretsiz Oyunları Keşfedin</title>
        <meta name="description" content="Epic Games ve Steam'deki ücretsiz ve yakında ücretsiz olacak oyunları keşfedin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h1 className="text-3xl font-bold mb-4">Ücretsiz Oyunlar</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Epic Games ve Steam platformlarında bulunan şu anda ücretsiz olan ve yakında ücretsiz olacak oyunları keşfedin.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                <div className="text-2xl font-bold">{totalGames}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Toplam Oyun</div>
              </div>
              
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                <div className="text-2xl font-bold">{epicFreeGames.length + steamFreeGames.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Ücretsiz Oyun</div>
              </div>
              
              <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                <div className="text-2xl font-bold">{upcomingEpicGames.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Yakında Ücretsiz</div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="free" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="free">Ücretsiz Oyunlar</TabsTrigger>
              <TabsTrigger value="upcoming">Yakında Ücretsiz</TabsTrigger>
            </TabsList>
            
            <TabsContent value="free">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 p-4 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              ) : (
                <FreeGamesList epicGames={epicFreeGames} steamGames={steamFreeGames} />
              )}
            </TabsContent>
            
            <TabsContent value="upcoming">
              <div>
                <h2 className="text-2xl font-bold mb-6">Yakında Ücretsiz Olacak Oyunlar</h2>
                
                {upcomingEpicGames.length === 0 ? (
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <p>Şu anda yakında ücretsiz olacak oyun bulunamadı.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {upcomingEpicGames.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        isUpcoming 
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Epic Games ve Steam'den ücretsiz oyunları getir
    const epicFreeGames = await getFreeGames();
    const upcomingEpicGames = await getUpcomingFreeGames();
    const steamFreeGames = await getFreeSteamGames();
    
    const totalGames = epicFreeGames.length + upcomingEpicGames.length + steamFreeGames.length;

    return {
      props: {
        epicFreeGames,
        upcomingEpicGames,
        steamFreeGames,
        totalGames
      },
      // Her 6 saatte bir yeniden oluştur
      revalidate: 6 * 60 * 60,
    };
  } catch (error) {
    console.error("Oyun verileri alınırken hata oluştu:", error);
    
    return {
      props: {
        epicFreeGames: [],
        upcomingEpicGames: [],
        steamFreeGames: [],
        totalGames: 0
      },
      revalidate: 60 * 60, // Bir saat sonra yeniden dene
    };
  }
}; 