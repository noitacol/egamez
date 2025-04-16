import axios from 'axios';

const EPIC_API_URL = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions';
const EPIC_STORE_URL = 'https://store-site-backend-static.ak.epicgames.com/storefront/v1/public/catalog';

export interface EpicGame {
  title: string;
  id: string;
  namespace: string;
  description: string;
  effectiveDate: string;
  keyImages: {
    type: string;
    url: string;
  }[];
  seller: {
    name: string;
  };
  price: {
    totalPrice: {
      discountPrice: number;
      originalPrice: number;
      discount: number;
    };
  };
  promotions: {
    promotionalOffers: {
      promotionalOffers: {
        startDate: string;
        endDate: string;
        discountSetting: {
          discountPercentage: number;
        };
      }[];
    }[];
    upcomingPromotionalOffers: {
      promotionalOffers: {
        startDate: string;
        endDate: string;
        discountSetting: {
          discountPercentage: number;
        };
      }[];
    }[];
  };
  categories: {
    path: string;
    name: string;
  }[];
  productSlug: string;
  urlSlug: string;
  source?: 'epic' | 'steam';
  isTrending?: boolean;
  isTempFree?: boolean;
}

export async function getFreeGames(): Promise<EpicGame[]> {
  try {
    const response = await axios.get(EPIC_API_URL, {
      params: {
        locale: 'tr',
        country: 'TR',
        allowCountries: 'TR',
      },
    });

    const games = response.data?.data?.Catalog?.searchStore?.elements || [];
    
    // Şu anda ücretsiz olan oyunlar
    const currentFreeGames = games.filter((game: EpicGame) => {
      const promotionalOffers = game.promotions?.promotionalOffers;
      return (
        promotionalOffers &&
        promotionalOffers.length > 0 &&
        promotionalOffers[0]?.promotionalOffers?.length > 0 &&
        promotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage === 0
      );
    });

    return currentFreeGames;
  } catch (error) {
    console.error('Epic Games API error:', error);
    return [];
  }
}

export async function getUpcomingFreeGames(): Promise<EpicGame[]> {
  try {
    const response = await axios.get(EPIC_API_URL, {
      params: {
        locale: 'tr',
        country: 'TR',
        allowCountries: 'TR',
      },
    });

    const games = response.data?.data?.Catalog?.searchStore?.elements || [];
    
    // Yakında ücretsiz olacak oyunlar
    const upcomingFreeGames = games.filter((game: EpicGame) => {
      const upcomingPromotionalOffers = game.promotions?.upcomingPromotionalOffers;
      return (
        upcomingPromotionalOffers &&
        upcomingPromotionalOffers.length > 0 &&
        upcomingPromotionalOffers[0]?.promotionalOffers?.length > 0
      );
    });

    return upcomingFreeGames;
  } catch (error) {
    console.error('Epic Games API error:', error);
    return [];
  }
}

export async function getGameDetails(namespace: string): Promise<EpicGame | null> {
  try {
    const response = await axios.get(EPIC_API_URL, {
      params: {
        locale: 'tr',
        country: 'TR',
        allowCountries: 'TR',
      },
    });

    const games = response.data?.data?.Catalog?.searchStore?.elements || [];
    
    const game = games.find((game: EpicGame) => game.namespace === namespace);
    
    return game || null;
  } catch (error) {
    console.error('Epic Games API error:', error);
    return null;
  }
}

/**
 * Epic Games'deki trend olan oyunları getirir
 */
export async function getTrendingEpicGames(): Promise<EpicGame[]> {
  try {
    // Epic Games'den ücretsiz oyunları al ve trending olarak işaretle
    // Epic API'deki trending endpoint'i çalışmadığı için ücretsiz oyunları trending olarak kullanıyoruz
    const freeGames = await getFreeGames();
    
    // Trending olarak işaretle
    const trendingGamesWithFlag = freeGames.map((game: EpicGame) => ({
      ...game,
      isTrending: true
    }));

    return trendingGamesWithFlag;
  } catch (error) {
    console.error('Epic Games trending API error:', error);
    return [];
  }
}

/**
 * Epic Games'deki indirimde olan oyunları getirir
 */
export async function getDiscountedEpicGames(): Promise<EpicGame[]> {
  try {
    // Epic Games'in katalog sayfasından veri çek
    const response = await axios.get(EPIC_STORE_URL, {
      params: {
        locale: 'tr',
        country: 'TR',
        allowCountries: 'TR',
        count: 30,
        sortBy: 'relevancy',
        sortDir: 'DESC',
        start: 0,
        tag: 'discounted',
      }
    });

    const games = response.data?.data?.Catalog?.searchStore?.elements || [];
    
    // İndirimde olan oyunları filtrele
    const discountedGames = games.filter((game: EpicGame) => {
      // İndirimde olan fakat hala bir fiyatı olan oyunlar
      return (
        game.price?.totalPrice?.discount > 0 && 
        game.price?.totalPrice?.discountPrice > 0
      );
    }).slice(0, 12);

    return discountedGames;
  } catch (error) {
    console.error('Epic Games discounted API error:', error);
    return [];
  }
}

/**
 * Epic Games'deki normal ücretli olup geçici olarak ücretsiz olan oyunları getirir
 */
export async function getTemporaryFreeEpicGames(): Promise<EpicGame[]> {
  try {
    const response = await axios.get(EPIC_API_URL, {
      params: {
        locale: 'tr',
        country: 'TR',
        allowCountries: 'TR',
      },
    });

    const games = response.data?.data?.Catalog?.searchStore?.elements || [];
    
    // Normalde ücretli olup şimdi ücretsiz olan oyunlar
    const tempFreeGames = games.filter((game: EpicGame) => {
      const promotionalOffers = game.promotions?.promotionalOffers;
      return (
        promotionalOffers &&
        promotionalOffers.length > 0 &&
        promotionalOffers[0]?.promotionalOffers?.length > 0 &&
        promotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage === 100 &&
        game.price?.totalPrice?.originalPrice > 0
      );
    });

    // Geçici ücretsiz olarak işaretle
    return tempFreeGames.map((game: EpicGame) => ({
      ...game,
      isTempFree: true,
      source: 'epic'
    }));
  } catch (error) {
    console.error('Epic Games temporary free games API error:', error);
    return [];
  }
} 