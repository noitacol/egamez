import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getGameDetails } from '../../lib/epic-api';
import { ExtendedEpicGame } from '../../components/GameCard';
import { getGameDetails as getSteamGameDetails, convertSteamToEpicFormat } from '../../lib/steam-api';

interface GameDetailProps {
  game: ExtendedEpicGame | null;
  error?: string;
}

export default function GameDetail({ game, error }: GameDetailProps) {
  const router = useRouter();
  
  // Oyun yükleme hatası
  if (error) {
    return (
      <Layout title="Hata | Epic Games">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-4 rounded-lg mb-6">
          {error}
        </div>
        <button
          onClick={() => router.push('/')}
          className="btn btn-primary"
          tabIndex={0}
          aria-label="Ana sayfaya dön"
        >
          Ana Sayfaya Dön
        </button>
      </Layout>
    );
  }
  
  // Oyun bulunamadı
  if (!game) {
    return (
      <Layout title="Oyun Bulunamadı | Epic Games">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Oyun Bulunamadı</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Aradığınız oyun bulunamadı veya artık mevcut değil.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary"
            tabIndex={0}
            aria-label="Ana sayfaya dön"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </Layout>
    );
  }
  
  // Oyun kaynağını kontrol et
  const isSteamGame = game.id.toString().startsWith('steam_');
  
  // Oyun kapak görselini bul
  const heroImage = game.keyImages?.find(img => img.type === 'DieselGameBoxTall') || 
                   game.keyImages?.find(img => img.type === 'DieselStoreFrontPortrait') || 
                   game.keyImages?.find(img => img.type === 'OfferImageWide') || 
                   game.keyImages?.[0];
                   
  // Oyunun ücretsiz olduğu tarihleri hesapla
  const offers = game.promotions?.promotionalOffers?.[0]?.promotionalOffers;
  const startDate = offers?.[0]?.startDate ? new Date(offers[0].startDate) : null;
  const endDate = offers?.[0]?.endDate ? new Date(offers[0].endDate) : null;
  
  // Ürün bağlantısı
  const storeLink = isSteamGame
    ? `https://store.steampowered.com/app/${game.id.toString().replace('steam_', '')}`
    : `https://store.epicgames.com/tr/p/${game.productSlug || game.urlSlug || game.id}`;
  
  // Metacritic puanı (varsa)
  const metacriticScore = (game as any).metacritic;
  
  return (
    <Layout
      title={`${game.title} | ${isSteamGame ? 'Steam' : 'Epic Games'}`}
      description={game.description || `${isSteamGame ? 'Steam' : 'Epic Games'} Store'da ${game.title} oyununu ücretsiz edinin.`}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          {heroImage && (
            <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
              <Image 
                src={heroImage.url} 
                alt={game.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
                priority
              />
            </div>
          )}
          
          {/* Mağaza bilgisi ve metacritic */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-gray-600 dark:text-gray-400">
              {isSteamGame ? 'Steam' : 'Epic Games Store'}
            </div>
            
            {metacriticScore && (
              <div className={`text-white px-3 py-1 rounded font-bold ${
                metacriticScore > 75 ? 'bg-green-600' : 
                metacriticScore > 60 ? 'bg-yellow-600' : 'bg-red-600'
              }`}>
                Metacritic: {metacriticScore}
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{game.title}</h1>
          
          <div className="mb-6">
            <div className="text-green-600 dark:text-green-400 text-2xl font-bold mb-2">Ücretsiz</div>
            
            {startDate && endDate && (
              <div className="text-gray-600 dark:text-gray-400">
                Ücretsiz alım süresi: {startDate.toLocaleDateString('tr-TR')} - {endDate.toLocaleDateString('tr-TR')}
              </div>
            )}
          </div>
          
          {game.description && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Açıklama</h2>
              <p className="text-gray-700 dark:text-gray-300">{game.description}</p>
            </div>
          )}
          
          {game.categories && game.categories.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Kategoriler</h2>
              <div className="flex flex-wrap gap-2">
                {game.categories.map(category => (
                  <span 
                    key={category.path} 
                    className="bg-gray-200 dark:bg-epicgray px-3 py-1 rounded-full text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <a 
              href={storeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary py-3 px-6 text-lg font-bold inline-block"
              tabIndex={0}
              aria-label={`${isSteamGame ? 'Steam' : 'Epic Games'} Store'da görüntüle`}
            >
              {isSteamGame ? 'Steam' : 'Epic Games'} Store'da Görüntüle
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id;
  
  if (!id || typeof id !== 'string') {
    return {
      props: {
        game: null,
        error: 'Geçerli bir oyun ID\'si belirtilmedi'
      }
    };
  }
  
  try {
    // Steam veya Epic Games oyunu mu kontrol et
    if (id.startsWith('steam_')) {
      // Steam oyun detaylarını getir
      const steamAppId = parseInt(id.replace('steam_', ''));
      
      if (isNaN(steamAppId)) {
        return {
          props: {
            game: null,
            error: 'Geçersiz Steam oyun ID\'si'
          }
        };
      }
      
      const steamGame = await getSteamGameDetails(steamAppId);
      
      if (!steamGame) {
        return {
          props: {
            game: null,
            error: 'Steam oyunu bulunamadı'
          }
        };
      }
      
      // Steam oyununu Epic formatına dönüştür
      const epicFormatGame = convertSteamToEpicFormat(steamGame);
      
      return {
        props: {
          game: epicFormatGame
        }
      };
    } else {
      // Epic Games oyun detaylarını getir
      const epicGame = await getGameDetails(id);
      
      if (!epicGame) {
        return {
          props: {
            game: null
          }
        };
      }
      
      return {
        props: {
          game: epicGame
        }
      };
    }
  } catch (error) {
    console.error('Error fetching game details:', error);
    return {
      props: {
        game: null,
        error: 'Oyun detayları yüklenirken bir hata oluştu'
      }
    };
  }
}; 