import axios from 'axios';
import { ExtendedEpicGame } from './types';

// Steam API sabitleri
const STEAM_API_KEY = 'YOUR_STEAM_API_KEY'; // Gerçek kullanımda API anahtarı eklenmelidir
const STEAM_STORE_API = 'https://store.steampowered.com/api';
const STEAM_API = 'https://api.steampowered.com';

// Trend olabilecek ücretsiz Steam oyun ID'leri
const FREE_STEAM_GAME_IDS = [
  570, // Dota 2
  730, // CS:GO
  440, // Team Fortress 2
  252490, // Rust
  230410, // Warframe
  578080, // PUBG
  1091500, // Cyberpunk 2077
  271590, // GTA V
  1245620, // Elden Ring
  594570, // Total War: WARHAMMER II
  1904540, // Age of Empires II: Definitive Edition
  1551360, // Forza Horizon 5
  493340, // Planet Coaster
  1222670, // The Outer Worlds
];

// Steam oyun veri tipi
export interface SteamGame {
  appid: number;
  name: string;
  required_age: number;
  is_free: boolean;
  controller_support?: string;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  supported_languages: string;
  header_image: string;
  website?: string;
  developers?: string[];
  publishers?: string[];
  price_overview?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
  };
  categories?: {
    id: number;
    description: string;
  }[];
  genres?: {
    id: string;
    description: string;
  }[];
  screenshots?: {
    id: number;
    path_thumbnail: string;
    path_full: string;
  }[];
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
  release_date: {
    coming_soon: boolean;
    date: string;
  };
  metacritic?: {
    score: number;
    url: string;
  };
}

/**
 * Steam Store API'den oyun detaylarını getirir
 */
export async function getGameDetails(appId: number): Promise<SteamGame | null> {
  try {
    const response = await axios.get(`${STEAM_STORE_API}/appdetails`, {
      params: {
        appids: appId,
        l: 'turkish' // Türkçe dil desteği
      }
    });

    if (response.data && response.data[appId] && response.data[appId].success) {
      return response.data[appId].data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching Steam game details for appId ${appId}:`, error);
    return null;
  }
}

/**
 * Verilen appId listesine göre tüm Steam oyunlarını getirir
 */
export async function getAllSteamGames(appIds: number[] = FREE_STEAM_GAME_IDS): Promise<SteamGame[]> {
  try {
    // Tüm istekleri topla
    const requests = appIds.map(appId => getGameDetails(appId));
    
    // Tüm istekleri paralel olarak çalıştır
    const responses = await Promise.allSettled(requests);
    
    // Başarılı yanıtları filtrele
    const games = responses
      .filter((response): response is PromiseFulfilledResult<SteamGame | null> => 
        response.status === 'fulfilled' && response.value !== null
      )
      .map(response => response.value as SteamGame);
    
    return games;
  } catch (error) {
    console.error('Error fetching Steam games:', error);
    return [];
  }
}

/**
 * Ücretsiz Steam oyunlarını getirir
 */
export async function getFreeSteamGames(): Promise<ExtendedEpicGame[]> {
  try {
    const allGames = await getAllSteamGames();
    
    // Ücretsiz oyunları filtrele
    const freeGames = allGames.filter(game => 
      game.is_free === true || 
      (game.price_overview && game.price_overview.final === 0)
    );
    
    // Epic formatına dönüştür
    return freeGames.map(game => convertSteamToEpicFormat(game));
  } catch (error) {
    console.error('Error fetching free Steam games:', error);
    return [];
  }
}

/**
 * İndirimde olan Steam oyunlarını getirir
 */
export async function getDiscountedSteamGames(): Promise<ExtendedEpicGame[]> {
  try {
    const allGames = await getAllSteamGames();
    
    // İndirimdeki oyunları filtrele
    const discountedGames = allGames.filter(game => 
      game.price_overview && 
      game.price_overview.discount_percent > 0
    );
    
    // Epic formatına dönüştür
    return discountedGames.map(game => convertSteamToEpicFormat(game));
  } catch (error) {
    console.error('Error fetching discounted Steam games:', error);
    return [];
  }
}

/**
 * Trend olan Steam oyunlarını getirir
 */
export async function getTrendingSteamGames(limit: number = 10): Promise<ExtendedEpicGame[]> {
  try {
    // Şimdilik tüm oyunları getir
    const allGames = await getAllSteamGames();
    
    // Yeni çıkan ve popüler oyunları filtrele
    const trendingGames = allGames
      .filter(game => {
        // Son 3 ay içinde çıkmış oyunlar
        const releaseDate = new Date(game.release_date.date);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        // Ücretsiz veya indirimde olan oyunlar trende dahil edilebilir
        const isFreeOrDiscounted = 
          game.is_free || 
          (game.price_overview && game.price_overview.discount_percent > 0);
        
        // Yeni çıkmış veya indirimli/ücretsiz oyunları dahil et
        return releaseDate > threeMonthsAgo || isFreeOrDiscounted;
      })
      .slice(0, limit);
    
    // Epic formatına dönüştür
    return trendingGames.map(game => convertSteamToEpicFormat(game));
  } catch (error) {
    console.error('Error fetching trending Steam games:', error);
    return [];
  }
}

/**
 * Steam oyun verisini Epic format tipine dönüştürür
 */
export function convertSteamToEpicFormat(game: SteamGame): ExtendedEpicGame {
  const keyImages = [
    {
      type: "DieselGameBoxLogo",
      url: game.header_image
    }
  ];
  
  // Ekran görüntülerini ekle
  if (game.screenshots && game.screenshots.length > 0) {
    game.screenshots.forEach(screenshot => {
      keyImages.push({
        type: "Screenshot",
        url: screenshot.path_full
      });
    });
  }
  
  // Video varsa ekle
  const videos = game.movies ? game.movies.map(movie => ({
    id: String(movie.id),
    thumbnail: movie.thumbnail,
    url: movie.mp4.max
  })) : [];
  
  // Fiyat bilgisini Epic Games formatına dönüştür
  const totalPrice = game.price_overview ? {
    discountPrice: game.price_overview.final / 100, // Steam'de kuruş olarak geliyor
    originalPrice: game.price_overview.initial / 100,
    discount: game.price_overview.discount_percent
  } : {
    discountPrice: 0,
    originalPrice: 0,
    discount: 0
  };
  
  // İndirim yüzdesi kontrolü
  const hasDiscount = game.price_overview && game.price_overview.discount_percent > 0;
  
  // Promosyonlar için oyunun ücretsiz veya indirimde olduğunu kontrol et
  const now = new Date();
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  
  // Promosyon tarihlerini oluştur
  const startDate = now.toISOString();
  const endDate = oneWeekLater.toISOString();
  
  // Promosyon ayarlarını oluştur
  const promotions = {
    promotionalOffers: game.is_free || hasDiscount ? [{
      promotionalOffers: [{
        startDate,
        endDate,
        discountSetting: {
          discountPercentage: game.is_free ? 100 : (game.price_overview?.discount_percent || 0)
        }
      }]
    }] : [],
    upcomingPromotionalOffers: []
  };
  
  return {
    id: String(game.appid),
    title: game.name,
    namespace: `steam_${game.appid}`,
    description: game.short_description,
    effectiveDate: game.release_date.date,
    keyImages,
    seller: {
      name: game.publishers?.[0] || "Steam"
    },
    price: {
      totalPrice
    },
    promotions,
    categories: game.categories?.map(category => ({
      path: category.description.toLowerCase().replace(/\s+/g, '-'),
      name: category.description
    })) || [],
    source: "steam",
    sourceLabel: "Steam",
    isFree: game.is_free,
    productSlug: game.name.toLowerCase().replace(/\s+/g, '-'),
    urlSlug: game.name.toLowerCase().replace(/\s+/g, '-'),
    videos,
    metacritic: game.metacritic,
    isTrending: true,
    distributionPlatform: "steam"
  };
} 