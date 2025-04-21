import axios from 'axios';
import { ExtendedEpicGame } from './types';

/**
 * Epic Games oyun tip tanımı
 */
export interface EpicGame {
  id: string;
  namespace: string;
  title: string;
  description: string;
  offerType: string;
  expiryDate: string | null;
  effectiveDate: string | null;
  status: string;
  isCodeRedemptionOnly: boolean;
  keyImages: Array<{
    type: string;
    url: string;
  }>;
  seller: {
    id: string;
    name: string;
  };
  productSlug: string;
  urlSlug: string;
  url: string | null;
  items: Array<{
    id: string;
    namespace: string;
  }>;
  customAttributes: Array<{
    key: string;
    value: string;
  }>;
  categories: Array<{
    path: string;
    name: string;
  }>;
  price: {
    totalPrice: {
      discountPrice: number;
      originalPrice: number;
      voucherDiscount: number;
      discount: number;
      currencyCode: string;
      currencyInfo: {
        decimals: number;
      };
      fmtPrice: {
        originalPrice: string;
        discountPrice: string;
        intermediatePrice: string;
      };
    };
  };
  promotions: {
    promotionalOffers: Array<{
      promotionalOffers: Array<{
        startDate: string;
        endDate: string;
        discountSetting: {
          discountType: string;
          discountPercentage: number;
        };
      }>;
    }>;
    upcomingPromotionalOffers: Array<{
      promotionalOffers: Array<{
        startDate: string;
        endDate: string;
        discountSetting: {
          discountType: string;
          discountPercentage: number;
        };
      }>;
    }>;
  };
  releaseDate?: string;
  sourceLabel?: string;
}

// API URL'leri - statik derleme sırasında tam URL kullanılır
const isServer = typeof window === 'undefined';
const BASE_URL = isServer 
  ? 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions' 
  : '/api/epic-store';
const EPIC_API_URL = `${BASE_URL}${isServer ? '?locale=tr-TR&country=TR&allowCountries=TR' : '?locale=tr-TR&country=TR&allowCountries=TR'}`;

/**
 * Oyun URL'sini düzelt ve optimize et
 */
const fixGameUrl = (game: EpicGame | ExtendedEpicGame): string => {
  // Firestone Online Idle RPG için özel düzeltme
  if (game.title === "Firestone Online Idle RPG") {
    return "https://store.epicgames.com/tr/p/firestone-online-idle-rpg-bfd04b";
  }
  
  // Slug bilgisi varsa kullan
  if (game.productSlug || game.urlSlug) {
    return `https://store.epicgames.com/tr/p/${game.productSlug || game.urlSlug}`;
  }
  
  // ID'yi kullanarak alternatif URL oluştur
  return `https://store.epicgames.com/tr/p/${game.id}`;
};

/**
 * Epic Games'ten ücretsiz oyunları getirir
 */
export const fetchFreeGames = async (): Promise<ExtendedEpicGame[]> => {
  try {
    const response = await axios.get(EPIC_API_URL);

    const games = response.data.data.Catalog.searchStore.elements;
    
    // Şu anda ücretsiz olan oyunları filtrele
    const freeGames = games.filter((game: EpicGame) => {
      const { promotionalOffers } = game.promotions || { promotionalOffers: [] };
      return promotionalOffers && promotionalOffers.length > 0;
    });

    return freeGames.map((game: EpicGame) => ({
      ...game,
      source: 'epic',
      sourceLabel: 'Epic Games',
      distributionPlatform: 'epic',
      isFree: true,
      isOnSale: false,
      platform: 'PC',
      url: fixGameUrl(game)
    }));
  } catch (error) {
    console.error('Epic ücretsiz oyunları getirme hatası:', error);
    return [];
  }
};

/**
 * Epic Games'ten yakında ücretsiz olacak oyunları getirir
 */
export const fetchUpcomingFreeGames = async (): Promise<ExtendedEpicGame[]> => {
  try {
    const response = await axios.get(EPIC_API_URL);

    const games = response.data.data.Catalog.searchStore.elements;
    
    // Yakında ücretsiz olacak oyunları filtrele
    const upcomingFreeGames = games.filter((game: EpicGame) => {
      const { upcomingPromotionalOffers } = game.promotions || { upcomingPromotionalOffers: [] };
      return upcomingPromotionalOffers && upcomingPromotionalOffers.length > 0;
    });

    return upcomingFreeGames.map((game: EpicGame) => ({
      ...game,
      source: 'epic',
      sourceLabel: 'Epic Games',
      distributionPlatform: 'epic',
      isFree: false,
      isUpcoming: true,
      isOnSale: false,
      platform: 'PC',
      url: fixGameUrl(game)
    }));
  } catch (error) {
    console.error('Epic yakında ücretsiz olacak oyunları getirme hatası:', error);
    return [];
  }
};

/**
 * Epic Games'ten oyun detaylarını getirir
 */
export const fetchGameDetails = async (id: string): Promise<ExtendedEpicGame | null> => {
  try {
    // Epic Games API üzerinden tüm oyunları getir
    const allGames = await fetchFreeGames();
    const upcomingGames = await fetchUpcomingFreeGames();
    
    // ID ile eşleşen oyunu bul
    const game = [...allGames, ...upcomingGames].find(game => game.id === id);
    
    if (!game) {
      console.error(`Epic: ${id} ID'sine sahip oyun bulunamadı`);
      return null;
    }

    // Var olan oyun verisini döndür
    return {
      ...game,
      source: 'epic',
      sourceLabel: 'Epic Games',
      distributionPlatform: 'epic',
      platform: 'PC',
      url: fixGameUrl(game)
    };
  } catch (error) {
    console.error('Epic oyun detaylarını getirme hatası:', error);
    return null;
  }
};

/**
 * Epic Games'ten trend oyunları getirir
 */
export const fetchTrendingGames = async (): Promise<ExtendedEpicGame[]> => {
  try {
    // Gerçek implementasyon eklenmeli
    return [];
  } catch (error) {
    console.error('Epic trend oyunları getirme hatası:', error);
    return [];
  }
};

/**
 * Epic Games'ten indirimli oyunları getirir
 */
export const fetchDiscountedGames = async (): Promise<ExtendedEpicGame[]> => {
  try {
    // Gerçek implementasyon eklenmeli
    return [];
  } catch (error) {
    console.error('Epic indirimli oyunları getirme hatası:', error);
    return [];
  }
}; 