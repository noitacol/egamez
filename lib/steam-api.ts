import axios from 'axios';

const STEAM_API_KEY = '7939B44042A20BCD809BC41CBDDE75BF';
const STEAM_API_URL = 'https://api.steampowered.com';
const STEAM_STORE_API_URL = 'https://store.steampowered.com/api';

export interface SteamGame {
  appid: number;
  name: string;
  description?: string;
  header_image: string;
  background_image?: string;
  price: {
    isFree: boolean;
    initialPrice?: number;
    finalPrice?: number;
    discount?: number;
    currency?: string;
  };
  categories?: {
    id: number;
    description: string;
  }[];
  release_date?: {
    date: string;
  };
  platforms?: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  developers?: string[];
  publishers?: string[];
  url?: string;
}

// Ücretsiz oyunların appID'lerini manuel olarak belirliyoruz
// Bu liste güncellenerek daha fazla oyun eklenebilir
const FREE_GAME_APPIDS = [
  570,    // Dota 2
  440,    // Team Fortress 2
  730,    // CS:GO
  252490, // Rust
  252950, // Rocket League
  1172470, // Apex Legends
  578080,  // PUBG
  1085660, // Destiny 2
  230410,  // Warframe
  1245620, // Elden Ring
  1091500, // Cyberpunk 2077
  1716740, // Palworld
];

/**
 * Steam'deki ücretsiz oyunları getirir
 */
export async function getFreeSteamGames(): Promise<SteamGame[]> {
  try {
    const freeGames: SteamGame[] = [];
    
    // Her oyun için detayları al
    const promises = FREE_GAME_APPIDS.map(async (appid) => {
      try {
        const response = await axios.get(`${STEAM_STORE_API_URL}/appdetails`, {
          params: {
            appids: appid,
            cc: 'tr',
            l: 'turkish'
          }
        });
        
        if (response.data[appid].success) {
          const gameData = response.data[appid].data;
          
          // Oyunun fiyatlandırması
          const price = gameData.price_overview ? {
            isFree: gameData.is_free,
            initialPrice: gameData.price_overview.initial / 100,
            finalPrice: gameData.price_overview.final / 100,
            discount: gameData.price_overview.discount_percent,
            currency: gameData.price_overview.currency
          } : { isFree: gameData.is_free };
          
          // Sadece ücretsiz veya tamamen indirimdeki oyunları ekle
          if (gameData.is_free || (price.finalPrice === 0 && price.discount > 0)) {
            const game: SteamGame = {
              appid: gameData.steam_appid,
              name: gameData.name,
              description: gameData.short_description,
              header_image: gameData.header_image,
              background_image: gameData.background,
              price,
              categories: gameData.categories,
              release_date: gameData.release_date,
              platforms: gameData.platforms,
              developers: gameData.developers,
              publishers: gameData.publishers,
              url: `https://store.steampowered.com/app/${gameData.steam_appid}`
            };
            
            return game;
          }
        }
        return null;
      } catch (error) {
        console.error(`Error fetching details for Steam app ${appid}:`, error);
        return null;
      }
    });
    
    const games = await Promise.all(promises);
    
    // null olmayan sonuçları filtrele
    return games.filter(game => game !== null) as SteamGame[];
  } catch (error) {
    console.error('Steam API error:', error);
    return [];
  }
}

/**
 * Belirli bir Steam oyununun haberlerini getirir
 */
export async function getSteamGameNews(appid: number, count: number = 3): Promise<any> {
  try {
    const response = await axios.get(`${STEAM_API_URL}/ISteamNews/GetNewsForApp/v0002/`, {
      params: {
        appid,
        count,
        maxlength: 300,
        format: 'json',
        key: STEAM_API_KEY
      }
    });
    
    return response.data.appnews.newsitems;
  } catch (error) {
    console.error(`Error fetching news for Steam app ${appid}:`, error);
    return [];
  }
}

/**
 * Epic Games formatına dönüştürür
 * Bu fonksiyon, Steam Game'i EpicGame formatına çevirerek UI'da tutarlı bir gösterim sağlar
 */
export function convertSteamToEpicFormat(steamGame: SteamGame): any {
  return {
    title: steamGame.name,
    id: `steam_${steamGame.appid}`,
    namespace: `steam_${steamGame.appid}`,
    description: steamGame.description || '',
    effectiveDate: steamGame.release_date?.date || new Date().toISOString(),
    keyImages: [
      {
        type: 'DieselStoreFrontWide',
        url: steamGame.header_image
      }
    ],
    seller: {
      name: steamGame.publishers?.[0] || 'Steam'
    },
    price: {
      totalPrice: {
        discountPrice: 0,
        originalPrice: steamGame.price.initialPrice ? steamGame.price.initialPrice * 100 : 0,
        discount: steamGame.price.discount || 100
      }
    },
    promotions: {
      promotionalOffers: [
        {
          promotionalOffers: [
            {
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 gün sonrası
              discountSetting: {
                discountPercentage: 100
              }
            }
          ]
        }
      ],
      upcomingPromotionalOffers: []
    },
    categories: [
      {
        path: 'games/edition/base',
        name: 'Base Game'
      }
    ],
    productSlug: `${steamGame.url}`,
    urlSlug: `${steamGame.url}`
  };
} 