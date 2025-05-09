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
 * GamerPower API'den sadece 'game' tipindeki oyunları getirir ve Epic formatına dönüştürür
 */
export async function getGamerPowerOnlyGamesAsEpicFormat(): Promise<ExtendedEpicGame[]> {
  try {
    const games = await getGamerPowerGamesByType('game');
    return games.map(game => convertGamerPowerToEpicFormat(game));
  } catch (error) {
    console.error('GamerPower games error:', error);
    return [];
  }
}

/**
 * GamerPower API'den sadece 'loot' tipindeki içerikleri getirir ve Epic formatına dönüştürür
 */
export async function getGamerPowerLootAsEpicFormat(): Promise<ExtendedEpicGame[]> {
  try {
    const loot = await getGamerPowerGamesByType('loot');
    return loot.map(item => {
      const epicFormat = convertGamerPowerToEpicFormat(item);
      return {
        ...epicFormat,
        offerType: 'loot',
        isLoot: true,
      };
    });
  } catch (error) {
    console.error('GamerPower loot error:', error);
    return [];
  }
}

/**
 * GamerPower API'den sadece 'beta' tipindeki oyunları getirir ve Epic formatına dönüştürür
 */
export async function getGamerPowerBetaAsEpicFormat(): Promise<ExtendedEpicGame[]> {
  try {
    const beta = await getGamerPowerGamesByType('beta');
    return beta.map(item => {
      const epicFormat = convertGamerPowerToEpicFormat(item);
      return {
        ...epicFormat,
        offerType: 'beta',
        isBeta: true,
      };
    });
  } catch (error) {
    console.error('GamerPower beta error:', error);
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

  // Video varsa ekle, yoksa boş dizi kullan
  const videoArray: { url: string; type?: string; thumbnailUrl?: string }[] = [];
  
  // Oyun tipine göre offerType'ı belirle
  const getOfferType = (type: string): string => {
    if (type.toLowerCase().includes('loot') || type.toLowerCase().includes('dlc')) {
      return 'loot';
    } else if (type.toLowerCase().includes('beta')) {
      return 'beta';
    } else {
      return 'free';
    }
  };
  
  // Platforma göre dağıtım platformunu belirle
  const getPlatformInfo = (platformStr: string) => {
    const platformsLower = platformStr.toLowerCase();
    
    // Oyunun yer aldığı tüm platformları ayrı ayrı tanımla
    const platformArray = platformsLower.split(', ').map(p => p.trim());
    
    // Önce Steam platformunu kontrol et
    if (platformsLower.includes('steam')) {
      return {
        distributionPlatform: 'steam',
        platform: 'Steam'
      };
    } 
    // Epic Games platform kontrolü
    else if (platformsLower.includes('epic')) {
      return {
        distributionPlatform: 'epic',
        platform: 'Epic Games'
      };
    } 
    // PlayStation platform kontrolü
    else if (platformsLower.includes('playstation') || platformsLower.includes('ps4') || platformsLower.includes('ps5')) {
      return {
        distributionPlatform: 'playstation',
        platform: 'PlayStation'
      };
    } 
    // Xbox platform kontrolü
    else if (platformsLower.includes('xbox')) {
      return {
        distributionPlatform: 'xbox',
        platform: 'Xbox'
      };
    } 
    // Nintendo kontrolü
    else if (platformsLower.includes('nintendo') || platformsLower.includes('switch')) {
      return {
        distributionPlatform: 'nintendo',
        platform: 'Nintendo Switch'
      };
    } 
    // Genel PC kontrolü
    else if (platformsLower.includes('pc')) {
      return {
        distributionPlatform: 'pc',
        platform: 'PC'
      };
    } 
    // Android kontrolü
    else if (platformsLower.includes('android')) {
      return {
        distributionPlatform: 'android',
        platform: 'Android'
      };
    } 
    // iOS kontrolü
    else if (platformsLower.includes('ios')) {
      return {
        distributionPlatform: 'ios',
        platform: 'iOS'
      };
    } 
    // Diğer platformlar
    else {
      return {
        distributionPlatform: 'other',
        platform: platformStr || 'Diğer'
      };
    }
  };
  
  // Platform bilgilerini al
  const platformInfo = getPlatformInfo(game.platforms);
  
  // Kaynak etiketini platformdan al
  let sourceLabel = platformInfo.platform;
  
  // Eğer platform diğer ise, daha genel bir etiket kullan
  if (platformInfo.distributionPlatform === 'other') {
    sourceLabel = 'Ücretsiz Oyun';
  }
  
  // Formatlı fiyat bilgisi
  const fmtPrice = {
    originalPrice: `$${price.toFixed(2)}`,
    discountPrice: "$0.00",
    intermediatePrice: "$0.00"
  };
  
  // GamerPower'dan gelen veriyi Epic Games formatına dönüştür
  return {
    id: game.id.toString(),
    title: game.title,
    description: game.description,
    keyImages,
    price: {
      totalPrice: {
        discountPrice: 0,
        originalPrice: price,
        voucherDiscount: 0,
        discount: price,
        currencyCode: "USD",
        currencyInfo: {
          decimals: 2
        },
        fmtPrice
      }
    },
    source: 'gamerpower', // Kaynak her zaman 'gamerpower' olacak
    sourceLabel,
    distributionPlatform: platformInfo.distributionPlatform,
    platform: platformInfo.platform,
    url: game.open_giveaway_url || game.gamerpower_url,
    isFree: true,
    isLoot: game.type === 'Game Loot' || game.type.includes('DLC'),
    isBeta: game.type === 'Beta' || game.type.includes('Beta'),
    offerType: getOfferType(game.type),
    videos: videoArray,
    worth: game.worth,
    namespace: '',
    status: 'ACTIVE',
    effectiveDate: game.published_date,
    expiryDate: game.end_date,
    categories: [{
      path: game.type.toLowerCase(),
      name: game.type
    }],
    seller: {
      id: '1',
      name: 'GamerPower'
    },
    productSlug: '',
    urlSlug: '',
    items: [],
    customAttributes: [],
    minimumOS: game.platforms.includes('PC') ? 'Windows' : '',
    timeLeft: game.end_date 
      ? new Date(game.end_date).getTime() - Date.now() 
      : undefined
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