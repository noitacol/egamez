import axios from 'axios';
import { ExtendedEpicGame } from '../lib/types';
import { getAllTemporaryFreeAppIds } from './api-extractor';

const STEAM_API_KEY = '7939B44042A20BCD809BC41CBDDE75BF';
const STEAM_API_URL = 'https://api.steampowered.com';
const STEAM_STORE_API_URL = 'https://store.steampowered.com/api';

export interface SteamGameImage {
  id: number;
  type: string;
  url: string;
}

export interface SteamGame {
  appid: number;
  name: string;
  description?: string;
  header_image: string;
  background_image?: string;
  screenshots?: SteamGameImage[];
  movies?: {
    id: number;
    name: string;
    thumbnail: string;
    webm: {
      480: string;
      max: string;
    };
    mp4: {
      480: string;
      max: string;
    };
  }[];
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
  promotionEndDate?: string; // Promosyon bitiş tarihi
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
 * Steam'deki trend olan oyunları getirir
 */
export async function getTrendingSteamGames(): Promise<SteamGame[]> {
  try {
    // Steam'in öne çıkan oyunlarını getir
    const response = await axios.get(`${STEAM_API_URL}/ISteamApps/GetAppList/v2/`);
    const appList = response.data?.applist?.apps || [];
    
    // Sabit bir trending oyun listesi - Normalde Steam API'den alınabilir
    // ama API sınırlamaları nedeniyle şu an için sabit bir liste kullanıyoruz
    const trendingAppIds = [
      730,    // Counter-Strike 2
      440,    // Team Fortress 2
      570,    // Dota 2
      252490, // Rust
      578080, // PUBG: BATTLEGROUNDS
      1172470, // Apex Legends
      1599340, // Lost Ark
      431960,  // Wallpaper Engine
      230410,  // Warframe
      304930,  // Unturned
    ];
    
    // Trend oyunların detaylarını al
    const trendingGames = await Promise.all(
      trendingAppIds
        .filter(appId => appId > 0)
        .map(async (appId) => {
          try {
            const details = await getGameDetails(appId);
            // Sadece ücretsiz olan trending oyunları al
            if (details && details.price?.isFree === true) {
              return {
                ...details,
                isTrending: true
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching details for app ID ${appId}:`, error);
            return null;
          }
        })
    );
    
    return trendingGames.filter(game => game !== null) as SteamGame[];
  } catch (error) {
    console.error('Steam trending API error:', error);
    return [];
  }
}

/**
 * Belirli bir oyunun detaylarını getir
 */
export async function getGameDetails(appid: number): Promise<SteamGame | null> {
  try {
    const response = await axios.get(`${STEAM_STORE_API_URL}/appdetails`, {
      params: {
        appids: appid,
        cc: 'tr',
        l: 'turkish',
        filters: 'basic,screenshots,movies,price_overview,platforms'
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
      
      // Ekran görüntülerini işle
      const screenshots = gameData.screenshots ? 
        gameData.screenshots.map((screenshot: any, index: number) => ({
          id: screenshot.id || index,
          type: 'screenshot',
          url: screenshot.path_full
        })) : [];
      
      // Videoları işle
      const movies = gameData.movies || [];
      
      const game: SteamGame = {
        appid: gameData.steam_appid,
        name: gameData.name,
        description: gameData.short_description || '',
        header_image: gameData.header_image || '',
        background_image: gameData.background || null,
        screenshots: screenshots,
        movies: movies,
        price,
        categories: gameData.categories || [],
        release_date: gameData.release_date || null,
        platforms: gameData.platforms || null,
        developers: gameData.developers || [],
        publishers: gameData.publishers || [],
        url: `https://store.steampowered.com/app/${gameData.steam_appid}`,
        isTemporaryFree: !gameData.is_free && price.finalPrice === 0 && price.discount > 0,
        promotionEndDate: gameData.promotion_end_date || null,
        metacritic: gameData.metacritic || null
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
 * Steam'den geçici olarak ücretsiz olan oyunları getir
 */
export async function getTemporaryFreeSteamGames(): Promise<SteamGame[]> {
  try {
    // Geçici ücretsiz oyunların listesini al
    const temporaryFreeApps = await getAllTemporaryFreeAppIds();
    
    if (temporaryFreeApps.length === 0) {
      console.log('Geçici ücretsiz oyun bulunamadı');
      return [];
    }
    
    // Oyunların detaylarını al ve döngüsel olarak döndür
    const games = await Promise.all(
      temporaryFreeApps.map(async (app) => {
        try {
          const game = await getGameDetails(app.appId);
          return game;
        } catch (error) {
          console.error(`Error fetching details for app ID ${app.appId}:`, error);
          return null;
        }
      })
    );
    
    // Null oyunları filtrele
    const validGames = games.filter(game => game !== null) as SteamGame[];
    
    // Oyunların endDate bilgisini ekle
    return validGames.map(game => {
      const temporaryInfo = temporaryFreeApps.find(app => app.appId === game.appid);
      return {
        ...game,
        isTemporaryFree: true,
        endDate: temporaryInfo?.endDate
      };
    });
  } catch (error) {
    console.error('Geçici ücretsiz oyunları getirirken hata:', error);
    return [];
  }
}

/**
 * Steam'deki indirimli oyunları getirir
 */
export async function getDiscountedSteamGames(): Promise<SteamGame[]> {
  try {
    // Steam'in indirimli oyunlarını getirmek için özel bir API olmadığından
    // manuel olarak populer indirimli oyunları listeliyoruz
    const discountedAppIds = [
      1172470, // Apex Legends
      1938090, // EA SPORTS FC™ 24 
      1716740, // Far Cry® 6
      814380,  // Sekiro: Shadows Die Twice
      1245620, // ELDEN RING
      1904540, // The Last of Us Part I
      1817070, // Cyberpunk 2077: Phantom Liberty
      1286680, // The Last of Us™ Part II
      601150,  // Devil May Cry 5
      1245620, // ELDEN RING
    ];
    
    // İndirimli oyunların detaylarını al
    const discountedGames = await Promise.all(
      discountedAppIds
        .filter(appId => appId > 0)
        .map(async (appId) => {
          try {
            const details = await getGameDetails(appId);
            if (details && details.price && details.price.discount && details.price.discount > 0) {
              return {
                ...details,
                isDiscounted: true
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching details for app ID ${appId}:`, error);
            return null;
          }
        })
    );
    
    return discountedGames.filter(game => game !== null) as SteamGame[];
  } catch (error) {
    console.error('Steam discounted API error:', error);
    return [];
  }
}

/**
 * Steam'deki yeni çıkan oyunları getirir
 */
export async function getNewReleasesSteamGames(): Promise<SteamGame[]> {
  try {
    // Steam'in yeni çıkan oyunlarını getirmek için özel bir API olmadığından
    // manuel olarak yeni çıkan oyunları listeliyoruz
    const newReleaseAppIds = [
      2730790, // Still Wakes the Deep
      2346010, // Palworld
      2795010, // Lunar Strain
      2689000, // Once Human
      1716450, // CONCORD
      2089020, // StarGlave
      2788830, // Stormlight
      2720900, // Arco
      2758610, // Shadows of Doubt: Black Label
      2734580, // Stormgate
    ];
    
    // Yeni oyunların detaylarını al
    const newGames = await Promise.all(
      newReleaseAppIds
        .filter(appId => appId > 0)
        .map(async (appId) => {
          try {
            const details = await getGameDetails(appId);
            // Son 3 ay içinde çıkan oyunları yeni olarak kabul et
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            
            if (details && details.release_date) {
              const releaseDate = new Date(details.release_date.date);
              if (releaseDate >= threeMonthsAgo) {
                return {
                  ...details,
                  isNewRelease: true
                };
              }
            }
            return null;
          } catch (error) {
            console.error(`Error fetching details for app ID ${appId}:`, error);
            return null;
          }
        })
    );
    
    return newGames.filter(game => game !== null) as SteamGame[];
  } catch (error) {
    console.error('Steam new releases API error:', error);
    return [];
  }
}

/**
 * Steam'deki en çok satan oyunları getirir
 */
export async function getTopSellerSteamGames(): Promise<SteamGame[]> {
  try {
    // Steam'in en çok satan oyunlar sayfasından veri çek
    const response = await axios.get(STEAM_TRENDING_URL, {
      params: {
        cc: 'tr',
        l: 'turkish'
      }
    });
    
    // En çok satan oyunlar kategorisini al
    const topSellerItems = response.data.top_sellers?.items || [];
    
    // Appid listesi oluştur
    const appIds = topSellerItems.map((item: { id: number }) => item.id);
    
    // Her oyun için detayları al
    const promises = appIds.map((appid: number) => getGameDetails(appid));
    const games = await Promise.all(promises);
    
    // null değerleri filtrele
    const validGames = games.filter(game => game !== null) as SteamGame[];
    
    // En çok satan oyunları al (en fazla 12 tane)
    const topSellers = validGames.slice(0, 12);
    
    return topSellers;
  } catch (error) {
    console.error('Error fetching top seller Steam games:', error);
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
export function convertSteamToEpicFormat(steamGame: SteamGame): ExtendedEpicGame {
  // Oyun başlığını kontrol et
  const title = steamGame.name && typeof steamGame.name === 'string' && steamGame.name.trim() !== '' 
    ? steamGame.name 
    : 'İsimsiz Steam Oyunu';
  
  // Başlık ve açıklama güvenliliği kontrolü
  const description = steamGame.description && typeof steamGame.description === 'string' 
    ? steamGame.description 
    : 'Bu Steam oyunu hakkında açıklama bulunmamaktadır.';
    
  // Resim kontrolü - header_image
  const headerImage = steamGame.header_image && typeof steamGame.header_image === 'string' 
    ? steamGame.header_image 
    : '/placeholder-steam-game.jpg';
    
  // Metacritic puanı varsa uygun formatta ayarla, yoksa null olarak ayarla
  const metacritic = steamGame.metacritic 
    ? { score: steamGame.metacritic.score, url: steamGame.metacritic.url } 
    : null;
  
  // Videolar varsa uygun formatta ayarla, yoksa boş dizi olarak ver
  const videos = steamGame.movies 
    ? steamGame.movies.map(movie => ({
        id: String(movie.id),
        thumbnail: movie.thumbnail || headerImage,
        url: movie.webm?.max || movie.mp4?.max || ''
      })) 
    : [];
  
  // Screenshots kontrolü
  const screenshots = steamGame.screenshots && Array.isArray(steamGame.screenshots) && steamGame.screenshots.length > 0
    ? steamGame.screenshots.map(screenshot => ({
        type: 'Screenshot',
        url: screenshot.url
      }))
    : [];
  
  // KeyImages oluştur
  const keyImages = [
    {
      type: 'OfferImageWide',
      url: headerImage
    },
    ...screenshots
  ];
    
  // Gelecek 1 yıl için bitiş tarihi oluştur
  const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
  
  // Varsayılan promotions nesnesi
  const defaultPromotions = {
    promotionalOffers: [],
    upcomingPromotionalOffers: []
  };
  
  // Ücretsiz oyunlar için promosyonları oluştur
  const freeGamePromotions = {
    promotionalOffers: [{
      promotionalOffers: [{
        discountSetting: {
          discountPercentage: 100
        },
        startDate: new Date().toISOString(),
        endDate: endDate
      }]
    }],
    upcomingPromotionalOffers: [{
      promotionalOffers: [{
        startDate: endDate,
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
        discountSetting: {
          discountPercentage: 0
        }
      }]
    }]
  };
  
  // Price güvenli şekilde kontrol et
  const price = {
    totalPrice: {
      discountPrice: typeof steamGame.price?.finalPrice === 'number' ? steamGame.price.finalPrice * 100 : 0,
      originalPrice: typeof steamGame.price?.initialPrice === 'number' ? steamGame.price.initialPrice * 100 : 0,
      discount: typeof steamGame.price?.discount === 'number' ? steamGame.price.discount : 0
    }
  };
  
  // Steam formatını Epic formatına dönüştür
  return {
    title,
    id: steamGame.appid.toString(),
    namespace: `steam_${steamGame.appid}`,
    description,
    effectiveDate: steamGame.release_date?.date || new Date().toISOString(),
    keyImages,
    seller: {
      name: steamGame.publishers?.[0] || 'Steam'
    },
    price,
    categories: steamGame.categories ? steamGame.categories.map(cat => ({ 
      path: cat.description.toLowerCase().replace(/\s+/g, '-'),
      name: cat.description
    })) : [],
    productSlug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    urlSlug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    // Promosyonlar - ücretsizse uygun bilgileri ekle
    promotions: steamGame.price?.isFree ? freeGamePromotions : defaultPromotions,
    // Genişletilmiş özellikler
    videos,
    metacritic,
    isFree: steamGame.price?.isFree || false,
    isUpcoming: steamGame.release_date?.coming_soon || false,
    isTrending: steamGame.isTrending || false,
    isOnSale: steamGame.price?.discount !== undefined && steamGame.price.discount > 0,
    isCodeRedemptionOnly: false,
    platform: 'steam', 
    distributionPlatform: 'steam',
    steamAppId: steamGame.appid.toString(),
    headerImage,
    publisher: steamGame.publishers?.[0] || 'Steam'
  };
} 