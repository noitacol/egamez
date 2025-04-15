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
    coming_soon?: boolean;
  };
  platforms?: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  developers?: string[];
  publishers?: string[];
  url?: string;
  isTemporaryFree?: boolean; // Dönemsel olarak ücretsiz mi?
  metacritic?: {
    score: number;
    url: string;
  };
  releaseYear?: number; // Çıkış yılı
  isTrending?: boolean; // Trend mi?
}

// Popüler oyunların appID'leri
// Bu liste güncellenebilir veya genişletilebilir
const POPULAR_GAME_APPIDS = [
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
  292030,  // The Witcher 3
  814380,  // Sekiro
  1174180, // Red Dead Redemption 2
  686810,  // Hell Let Loose
  594570,  // Total War: WARHAMMER II
  306130,  // The Elder Scrolls® Online
  346110,  // ARK: Survival Evolved
  1506830, // FIFA 23
  648800,  // Raft
  550,     // Left 4 Dead 2
  377160,  // Fallout 4
  1174370, // STAR WARS: Jedi Fallen Order
  1811260, // EA Sports FC 24
  1938010, // Call of Duty
  289070,  // Civ VI
  1237970, // Titanfall 2
  1222140, // The Sims 4
  582010,  // Monster Hunter: World
  976730,  // Halo: The Master Chief Collection
  1167410, // Grand Theft Auto V Premium Edition
  1091500, // Cyberpunk 2077
  1449560, // High on Life
  975150,  // Dying Light 2 Stay Human
];

// Steam trending oyunlarını almak için kullanılacak API URL'i
const STEAM_TRENDING_URL = 'https://store.steampowered.com/api/featuredcategories';

/**
 * Trend olan oyunları getir
 */
export async function getTrendingSteamGames(): Promise<SteamGame[]> {
  try {
    // Steam'in trend sayfasından veri çek
    const response = await axios.get(STEAM_TRENDING_URL, {
      params: {
        cc: 'tr',
        l: 'turkish'
      }
    });

    // Trendler, yeni çıkanlar ve ücretsiz oyunlar kategorileri
    const trendingItems = [
      ...(response.data.specials?.items || []),
      ...(response.data.new_releases?.items || []),
      ...(response.data.top_sellers?.items || []),
      ...(response.data.coming_soon?.items || [])
    ];
    
    // Appid listesi oluştur
    const appIds = trendingItems.map(item => item.id);
    
    // Eğer trending kategorisinde oyun bulunamazsa popüler listeye geri dön
    if (appIds.length === 0) {
      return getAllSteamGames().then(games => 
        games.filter(game => game?.price?.isFree || game?.isTemporaryFree)
             .slice(0, 10)
      );
    }
    
    // Her oyun için detayları al
    const promises = appIds.map(appid => getGameDetails(appid));
    const games = await Promise.all(promises);
    
    // null değerleri filtrele
    const validGames = games.filter(game => game !== null) as SteamGame[];
    
    // Ücretsiz olan oyunları filtrele ve trend olarak işaretle
    const trendingFreeGames = validGames
      .filter(game => game.price?.isFree || game.isTemporaryFree)
      .map(game => ({ 
        ...game, 
        isTrending: true 
      } as SteamGame));
    
    // Yalnızca son 1 yıl içinde çıkan oyunları getir (yeni oyunlar)
    const currentYear = new Date().getFullYear();
    const recentGames = trendingFreeGames.filter(game => {
      // Çıkış tarihini kontrol et
      if (!game.release_date?.date) return true;
      
      const releaseDate = new Date(game.release_date.date);
      const releaseYear = releaseDate.getFullYear();
      
      // TypeScript uyumluluğu için güvenli bir şekilde atama yap
      const updatedGame = game as SteamGame;
      updatedGame.releaseYear = releaseYear;
      
      return currentYear - releaseYear <= 1; // Son 1 yıl içinde çıkan oyunlar
    });
    
    // Yeni oyun yoksa, tüm trend oyunlarını döndür
    return recentGames.length > 0 ? recentGames : trendingFreeGames;
  } catch (error) {
    console.error('Error fetching trending Steam games:', error);
    // Hata durumunda normal getFreeSteamGames fonksiyonuna geri dön
    return getTemporaryFreeSteamGames();
  }
}

/**
 * Belirli bir oyunun detaylarını getir
 */
async function getGameDetails(appid: number): Promise<SteamGame | null> {
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
        url: `https://store.steampowered.com/app/${gameData.steam_appid}`,
        isTemporaryFree: !gameData.is_free && price.finalPrice === 0 && price.discount > 0,
        metacritic: gameData.metacritic
      };
      
      return game;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching details for Steam app ${appid}:`, error);
    return null;
  }
}

/**
 * Steam'den tüm oyunları getirir
 */
export async function getAllSteamGames(): Promise<SteamGame[]> {
  try {
    // Her oyun için detayları al
    const promises = POPULAR_GAME_APPIDS.map(async (appid) => {
      return getGameDetails(appid);
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
 * Steam'deki ücretsiz oyunları getirir
 */
export async function getFreeSteamGames(): Promise<SteamGame[]> {
  const allGames = await getAllSteamGames();
  return allGames.filter(game => game?.price?.isFree);
}

/**
 * Steam'de normalde ücretli olup şu anda tamamen ücretsiz olan oyunları getirir
 */
export async function getTemporaryFreeSteamGames(): Promise<SteamGame[]> {
  const allGames = await getAllSteamGames();
  return allGames.filter(game => 
    game?.price && 
    !game.price.isFree && // Normalde ücretsiz değil
    game.price.finalPrice === 0 && // Şu an fiyatı 0
    (game.price.discount ?? 0) > 0 && // İndirimde
    game.isTemporaryFree // İşaretlenmiş
  );
}

/**
 * Steam'deki indirimli oyunları getirir
 */
export async function getDiscountedSteamGames(): Promise<SteamGame[]> {
  const allGames = await getAllSteamGames();
  return allGames.filter(game => 
    game?.price && 
    !game.price.isFree && // Ücretsiz oyun değil
    (game.price.discount ?? 0) > 0 && // İndirimde
    (game.price.finalPrice ?? 0) > 0 // Hala bir fiyatı var
  );
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
  // Normalde ücretli olup şu an ücretsiz olan oyunlar için bitiş tarihi
  const endDate = steamGame.isTemporaryFree 
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Varsayılan olarak 7 gün
    : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    
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
        discountPrice: steamGame.price.finalPrice ? steamGame.price.finalPrice * 100 : 0,
        originalPrice: steamGame.price.initialPrice ? steamGame.price.initialPrice * 100 : 0,
        discount: steamGame.price.discount || 0
      }
    },
    promotions: {
      promotionalOffers: steamGame.isTemporaryFree ? [
        {
          promotionalOffers: [
            {
              startDate: new Date().toISOString(),
              endDate: endDate.toISOString(),
              discountSetting: {
                discountPercentage: 100
              }
            }
          ]
        }
      ] : [],
      upcomingPromotionalOffers: []
    },
    categories: [
      {
        path: 'games/edition/base',
        name: 'Base Game'
      }
    ],
    isTemporaryFree: steamGame.isTemporaryFree, // Özel alan
    isTrending: steamGame.isTrending, // Trend mi?
    releaseYear: steamGame.releaseYear, // Çıkış yılı
    metacritic: steamGame.metacritic?.score, // Metacritic puanı
    productSlug: `${steamGame.url}`,
    urlSlug: `${steamGame.url}`
  };
} 