import axios from 'axios';
import { ExtendedEpicGame } from './types';

const GAMERPOWER_API_URL = 'https://www.gamerpower.com/api';

// GamerPower API'den dönen oyun veri tipi
export interface GamerPowerGame {
  id: number;
  title: string;
  worth: string;
  thumbnail: string;
  image: string;
  description: string;
  instructions: string;
  open_giveaway_url: string;
  published_date: string;
  type: string;
  platforms: string;
  end_date: string | null;
  users: number;
  status: string;
  gamerpower_url: string;
  open_giveaway: string;
}

// GamerPower API'den dönen toplam değer bilgisi
export interface GamerPowerWorth {
  worth: string;
  giveaways_count: number;
}

/**
 * GamerPower API'den tüm aktif oyun giveaway'lerini getirir
 */
export async function getAllGamerPowerGames(): Promise<GamerPowerGame[]> {
  try {
    const response = await axios.get(`${GAMERPOWER_API_URL}/giveaways`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('GamerPower API error:', error);
    return [];
  }
}

/**
 * GamerPower API'den tüm ücretsiz oyunları getirir
 */
export async function getFreeGamerPowerGames(): Promise<GamerPowerGame[]> {
  try {
    const response = await axios.get(`${GAMERPOWER_API_URL}/giveaways`);
    
    if (response.status !== 200) {
      throw new Error(`GamerPower API responded with status: ${response.status}`);
    }
    
    // Eğer API yanıtı bir hata içeriyorsa
    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'GamerPower API returned an error');
    }
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching GamerPower games:', error);
    return [];
  }
}

/**
 * GamerPower API'den belirli bir platforma göre ücretsiz oyunları getirir
 * @param platform Platform adı (pc, steam, epic-games, switch, ps4, xbox-one, android, ios, vr...)
 */
export async function getGamerPowerGamesByPlatform(platform: string): Promise<GamerPowerGame[]> {
  try {
    const response = await axios.get(`${GAMERPOWER_API_URL}/giveaways?platform=${platform}`);
    
    if (response.status !== 200) {
      throw new Error(`GamerPower API responded with status: ${response.status}`);
    }
    
    // Eğer API yanıtı bir hata içeriyorsa
    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'GamerPower API returned an error');
    }
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching GamerPower games for platform ${platform}:`, error);
    return [];
  }
}

/**
 * GamerPower API'den belirli bir oyun tipine göre ücretsiz oyunları getirir
 * @param type Oyun tipi (game, loot, beta...)
 */
export async function getGamerPowerGamesByType(type: string): Promise<GamerPowerGame[]> {
  try {
    const response = await axios.get(`${GAMERPOWER_API_URL}/giveaways?type=${type}`);
    
    if (response.status !== 200) {
      throw new Error(`GamerPower API responded with status: ${response.status}`);
    }
    
    // Eğer API yanıtı bir hata içeriyorsa
    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'GamerPower API returned an error');
    }
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching GamerPower games for type ${type}:`, error);
    return [];
  }
}

/**
 * GamerPower API'den oyunları sıralı şekilde getirir
 * @param sort Sıralama kriteri (date, value, popularity)
 */
export async function getGamerPowerGamesSorted(sort: 'date' | 'value' | 'popularity'): Promise<GamerPowerGame[]> {
  try {
    const response = await axios.get(`${GAMERPOWER_API_URL}/giveaways?sort-by=${sort}`);
    
    if (response.status !== 200) {
      throw new Error(`GamerPower API responded with status: ${response.status}`);
    }
    
    // Eğer API yanıtı bir hata içeriyorsa
    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'GamerPower API returned an error');
    }
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching GamerPower games sorted by ${sort}:`, error);
    return [];
  }
}

/**
 * GamerPower API'den belirli bir giveaway'in ayrıntılarını getirir
 */
export async function getGamerPowerGiveawayById(id: number): Promise<GamerPowerGame | null> {
  try {
    const response = await axios.get(`${GAMERPOWER_API_URL}/giveaway`, {
      params: {
        id
      }
    });
    
    // API başarısız olduğunda "status" alanında bilgi döndürüyor
    if (response.data && !response.data.status) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`GamerPower API error for giveaway ID ${id}:`, error);
    return null;
  }
}

/**
 * GamerPower API'den tüm giveaway'lerin toplam değerini getirir
 */
export async function getGamerPowerWorth(): Promise<GamerPowerWorth> {
  try {
    const response = await axios.get(`${GAMERPOWER_API_URL}/worth`);
    
    if (response.data) {
      return {
        worth: response.data.worth || "$0",
        giveaways_count: response.data.giveaways_count || 0
      };
    }
    return { worth: "$0", giveaways_count: 0 };
  } catch (error) {
    console.error('GamerPower API worth error:', error);
    return { worth: "$0", giveaways_count: 0 };
  }
}

/**
 * GamerPower oyunlarını ExtendedEpicGame formatına dönüştürür
 */
export function convertGamerPowerToEpicFormat(game: GamerPowerGame): ExtendedEpicGame {
  // Platformları dizi haline getir
  const platforms = game.platforms.split(', ').map(p => p.trim());
  
  // Oyun değerini sayısal değere dönüştür
  const worth = game.worth.replace('$', '').trim();
  const price = parseFloat(worth) || 0;
  
  // Kapak resmini ve görüntüleri hazırla
  const keyImages = [
    {
      type: 'thumbnail',
      url: game.thumbnail
    },
    {
      type: 'cover',
      url: game.image
    }
  ];
  
  // Platforma göre dağıtım platformunu belirle
  const getPlatformInfo = (platformStr: string) => {
    const platforms = platformStr.toLowerCase();
    
    if (platforms.includes('steam')) {
      return {
        distributionPlatform: 'steam',
        platform: 'Steam'
      };
    } else if (platforms.includes('epic')) {
      return {
        distributionPlatform: 'epic',
        platform: 'Epic Games'
      };
    } else if (platforms.includes('playstation') || platforms.includes('ps4') || platforms.includes('ps5')) {
      return {
        distributionPlatform: 'playstation',
        platform: 'PlayStation'
      };
    } else if (platforms.includes('xbox')) {
      return {
        distributionPlatform: 'xbox',
        platform: 'Xbox'
      };
    } else if (platforms.includes('pc')) {
      return {
        distributionPlatform: 'pc',
        platform: 'PC'
      };
    } else if (platforms.includes('android')) {
      return {
        distributionPlatform: 'android',
        platform: 'Android'
      };
    } else if (platforms.includes('ios')) {
      return {
        distributionPlatform: 'ios',
        platform: 'iOS'
      };
    } else {
      // Varsayılan dağıtım platformu
      return {
        distributionPlatform: 'other',
        platform: platforms
      };
    }
  };
  
  // Platform bilgilerini al
  const platformInfo = getPlatformInfo(game.platforms);
  
  return {
    id: `gp-${game.id}`,
    title: game.title,
    namespace: `gamerpower-${game.id}`,
    description: game.description,
    effectiveDate: game.published_date,
    keyImages,
    price: {
      totalPrice: {
        discountPrice: 0,
        originalPrice: price,
        discount: price
      }
    },
    source: 'gamerpower',
    distributionPlatform: platformInfo.distributionPlatform,
    platform: platformInfo.platform,
    offerType: game.type.toLowerCase(),
    endDate: game.end_date,
    url: game.open_giveaway_url,
    categories: [{
      path: game.type.toLowerCase(),
      name: game.type
    }],
    isFree: true,
    isOnSale: true,
    publisher: '',
    seller: {
      name: 'GamerPower'
    },
    productSlug: `gamerpower-${game.id}`,
    urlSlug: `gamerpower-${game.id}`,
    promotions: {
      promotionalOffers: [
        {
          promotionalOffers: [
            {
              startDate: game.published_date,
              endDate: game.end_date || '',
              discountSetting: {
                discountPercentage: 100
              }
            }
          ]
        }
      ],
      upcomingPromotionalOffers: []
    },
    isCodeRedemptionOnly: false
  };
}

/**
 * GamerPower API'den oyunları getirir ve Epic formatına dönüştürür
 */
export async function getGamerPowerGamesAsEpicFormat(): Promise<ExtendedEpicGame[]> {
  try {
    const gpGames = await getFreeGamerPowerGames();
    return gpGames.map(game => convertGamerPowerToEpicFormat(game));
  } catch (error) {
    console.error('GamerPower conversion error:', error);
    return [];
  }
}

/**
 * GamerPower API'den filtrelenmiş oyunları getirir
 * @param type Oyun tipi (game, loot, beta...)
 * @param platform Platform adı (pc, steam, epic-games, switch, ps4, xbox-one, android, ios, vr...)
 * @param sort Sıralama kriteri (date, value, popularity)
 */
export async function getFilteredGamerPowerGames(
  type?: string,
  platform?: string,
  sort?: 'date' | 'value' | 'popularity'
): Promise<ExtendedEpicGame[]> {
  try {
    let url = `${GAMERPOWER_API_URL}/giveaways`;
    const params = [];
    
    if (type) params.push(`type=${type}`);
    if (platform) params.push(`platform=${platform}`);
    if (sort) params.push(`sort-by=${sort}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      throw new Error(`GamerPower API responded with status: ${response.status}`);
    }
    
    // Eğer API yanıtı bir hata içeriyorsa
    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'GamerPower API returned an error');
    }
    
    // GamerPower oyunlarını Epic formata dönüştür
    const games = Array.isArray(response.data) ? response.data : [];
    return games.map(game => convertGamerPowerToEpicFormat(game));
  } catch (error) {
    console.error('Error fetching filtered GamerPower games:', error);
    return [];
  }
}

/**
 * GamerPower API'den trend olan oyunları getirir
 * Popülerliğe göre sıralanmış olarak sunar
 */
export async function getTrendingGamerPowerGames(): Promise<ExtendedEpicGame[]> {
  try {
    // Popülerliğe göre sıralanmış GamerPower oyunlarını getir
    const games = await getGamerPowerGamesSorted('popularity');
    
    // Sadece ilk 10 oyunu al ve dönüştür 
    const trendingGames = games.slice(0, 10).map(game => {
      const epicFormatGame = convertGamerPowerToEpicFormat(game);
      
      // Trend olarak işaretle
      return {
        ...epicFormatGame,
        isTrending: true
      };
    });
    
    return trendingGames;
  } catch (error) {
    console.error('GamerPower trending games error:', error);
    return [];
  }
} 