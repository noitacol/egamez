import axios from 'axios';

const EPIC_API_URL = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions';

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
}

export async function getFreeGames(): Promise<EpicGame[]> {
  try {
    console.log('Fetching free games from Epic API...');
    const response = await axios.get(EPIC_API_URL, {
      params: {
        locale: 'tr',
        country: 'TR',
        allowCountries: 'TR',
      },
    });

    const games = response.data?.data?.Catalog?.searchStore?.elements || [];
    console.log(`Found ${games.length} total games from Epic API`);
    
    // Şu anda ücretsiz olan oyunlar
    const currentFreeGames = games.filter((game: EpicGame) => {
      // Oyun fiyat ve promosyon bilgilerini kontrol et
      const promotionalOffers = game.promotions?.promotionalOffers || [];
      const offers = promotionalOffers[0]?.promotionalOffers || [];
      const price = game.price?.totalPrice;
      
      // Oyun zaten tamamen ücretsiz mi?
      if (price?.originalPrice === 0) {
        return false;
      }
      
      // Aktif promosyon var mı?
      if (promotionalOffers.length === 0 || offers.length === 0) {
        return false;
      }
      
      // Promosyon süresini kontrol et
      const now = new Date();
      const startDate = new Date(offers[0]?.startDate);
      const endDate = new Date(offers[0]?.endDate);
      
      if (now < startDate || now > endDate) {
        return false;
      }
      
      // Tamamen ücretsiz mi?
      const isFreeByDiscount = offers[0]?.discountSetting?.discountPercentage === 100;
      const isFreeByPrice = price?.discountPrice === 0;
      
      return isFreeByDiscount || isFreeByPrice;
    });

    console.log(`Found ${currentFreeGames.length} free games`);
    
    if (currentFreeGames.length > 0) {
      currentFreeGames.forEach((game: EpicGame) => {
        console.log(`Free game: ${game.title}`);
      });
    } else {
      console.log('No free games found');
    }

    return currentFreeGames;
  } catch (error) {
    console.error('Epic Games API error:', error);
    return [];
  }
}

export async function getUpcomingFreeGames(): Promise<EpicGame[]> {
  try {
    console.log('Fetching upcoming free games from Epic API...');
    const response = await axios.get(EPIC_API_URL, {
      params: {
        locale: 'tr',
        country: 'TR',
        allowCountries: 'TR',
      },
    });

    const games = response.data?.data?.Catalog?.searchStore?.elements || [];
    console.log(`Total games from API: ${games.length}`);
    
    // Yakında ücretsiz olacak oyunlar
    const upcomingFreeGames = games.filter((game: EpicGame) => {
      const upcomingOffers = game.promotions?.upcomingPromotionalOffers || [];
      const offers = upcomingOffers[0]?.promotionalOffers || [];
      
      if (upcomingOffers.length === 0 || offers.length === 0) {
        return false;
      }
      
      // Yakında ücretsiz olacak mı?
      const price = game.price?.totalPrice;
      if (price?.originalPrice === 0) {
        return false; // Zaten ücretsiz
      }
      
      const discountPercentage = offers[0]?.discountSetting?.discountPercentage;
      return discountPercentage === 100 || discountPercentage === 0;
    });

    console.log(`Found ${upcomingFreeGames.length} upcoming free games`);
    
    if (upcomingFreeGames.length > 0) {
      upcomingFreeGames.forEach((game: EpicGame) => {
        console.log(`Upcoming free game: ${game.title}`);
      });
    } else {
      console.log('No upcoming free games found');
    }

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