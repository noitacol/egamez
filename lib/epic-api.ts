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
        game.price?.totalPrice?.originalPrice !== 0 &&
        (
          promotionalOffers[0]?.promotionalOffers[0]?.discountSetting?.discountPercentage === 0 ||
          game.price?.totalPrice?.discountPrice === 0
        )
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