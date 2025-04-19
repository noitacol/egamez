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
  end_date: string;
  users: number;
  status: string;
  gamerpower_url: string;
  open_giveaway: string;
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
 * GamerPower API'den sadece ücretsiz oyunları getirir (DLC vb. hariç)
 */
export async function getFreeGamerPowerGames(): Promise<GamerPowerGame[]> {
  try {
    const response = await axios.get(`${GAMERPOWER_API_URL}/giveaways`, {
      params: {
        type: 'game'
      }
    });
    
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
 * GamerPower API'den platforma göre oyunları getirir
 */
export async function getGamerPowerGamesByPlatform(platform: string): Promise<GamerPowerGame[]> {
  try {
    const response = await axios.get(`${GAMERPOWER_API_URL}/giveaways`, {
      params: {
        platform
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error(`GamerPower API error for platform ${platform}:`, error);
    return [];
  }
}

/**
 * GamerPower oyunlarını ExtendedEpicGame formatına dönüştürür
 */
export function convertGamerPowerToEpicFormat(gpGame: GamerPowerGame): ExtendedEpicGame {
  // Platformları parse et
  const platforms = gpGame.platforms.split(', ');
  
  // Fiyat değerini parse et (örn: "$19.99" -> 19.99)
  const worthValue = parseFloat(gpGame.worth.replace(/[^0-9.]/g, '')) || 0;
  
  // Bitiş tarihini parse et
  const endDate = gpGame.end_date ? new Date(gpGame.end_date).toISOString() : '';
  
  // Yayınlanma tarihini parse et
  const publishedDate = gpGame.published_date ? new Date(gpGame.published_date) : new Date();
  
  // Desteklenen platform kontrolü
  const platformToUse = platforms[0]?.toLowerCase() || '';
  let distributionPlatform: 'epic' | 'steam' | 'gamerpower' = 'gamerpower';
  
  // Platformlardan bilinen bir platform var mı kontrol et
  if (platformToUse.includes('steam')) {
    distributionPlatform = 'steam';
  } else if (platformToUse.includes('epic')) {
    distributionPlatform = 'epic';
  }
  
  // Promosyon alanını oluştur - her GamerPower oyunu ücretsiz kabul edilir
  const promotions = {
    promotionalOffers: [
      {
        promotionalOffers: [
          {
            startDate: publishedDate.toISOString(),
            endDate: endDate || new Date(publishedDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Eğer bitiş tarihi yoksa 30 gün ekle
            discountSetting: {
              discountPercentage: 100 // Ücretsiz
            }
          }
        ]
      }
    ],
    upcomingPromotionalOffers: []
  };
  
  // ExtendedEpicGame formatında oyun objesi oluştur
  return {
    id: gpGame.id.toString(),
    title: gpGame.title,
    namespace: `gamerpower-${gpGame.id}`,
    description: gpGame.description,
    effectiveDate: gpGame.published_date,
    keyImages: [
      {
        type: 'thumbnail',
        url: gpGame.thumbnail
      },
      {
        type: 'featuredMedia',
        url: gpGame.image
      }
    ],
    seller: {
      name: 'GamerPower'
    },
    price: {
      totalPrice: {
        discountPrice: 0,
        originalPrice: worthValue,
        discount: 100
      }
    },
    categories: platforms.map(platform => ({
      path: platform.toLowerCase().replace(/\s+/g, '-'),
      name: platform
    })),
    productSlug: gpGame.title.toLowerCase().replace(/\s+/g, '-'),
    urlSlug: gpGame.title.toLowerCase().replace(/\s+/g, '-'),
    promotions: promotions, // Promosyon bilgisini ekledik
    
    // ExtendedEpicGame'e özel alanlar
    source: 'gamerpower',
    platform: 'gamerpower',
    distributionPlatform,
    openGiveawayUrl: gpGame.open_giveaway_url,
    instructions: gpGame.instructions,
    endDate: endDate,
    isFree: true,
    gamerPowerUrl: gpGame.gamerpower_url,
    status: gpGame.status,
    worthString: gpGame.worth,
    type: gpGame.type
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