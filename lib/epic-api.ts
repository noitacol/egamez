import axios from 'axios';
import { EpicGame, EpicGamesResponse, EpicElementsResponse, ExtendedEpicGame } from './types';

// API URL'leri ve GraphQL endpointleri
const EPIC_GRAPHQL_URL = 'https://store.epicgames.com/graphql';
const MAPPING_QUERY_HASH = '781fd69ec8116125fa8dc245c0838198cdf5283e31647d08dfa27f45ee8b1f30';
const CATALOG_QUERY_HASH = '6797fe39bfac0e6ea1c5fce0ecbff58684157595fee77e446b4254ec45ee2dcb';

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

// Epic Games Store API URL'si
const BASE_URL = 'https://graphql.epicgames.com/graphql';
const isServer = typeof window === 'undefined';
const EPIC_API_URL = `${BASE_URL}${isServer ? '?locale=tr-TR&country=TR&allowCountries=TR' : '?locale=tr-TR&country=TR&allowCountries=TR'}`;

// Epic Games API - Ücretsiz oyunlar (Devre dışı bırakıldı)
export const fetchFreeGames = async (): Promise<ExtendedEpicGame[]> => {
  // Gerçek API çağrısı yerine boş dizi döndür
  console.log('Epic API çağrıları devre dışı bırakıldı, boş veri döndürülüyor.');
  return [];
};

// Epic Games API - Yakında ücretsiz olacak oyunlar (Devre dışı bırakıldı)
export const fetchUpcomingFreeGames = async (): Promise<ExtendedEpicGame[]> => {
  // Gerçek API çağrısı yerine boş dizi döndür
  console.log('Epic API çağrıları devre dışı bırakıldı, boş veri döndürülüyor.');
  return [];
};

// Epic Games API - Günümüzde çok oynanan oyunlar (Devre dışı bırakıldı)
export const fetchTrendingGames = async (): Promise<ExtendedEpicGame[]> => {
  // Gerçek API çağrısı yerine boş dizi döndür
  console.log('Epic API çağrıları devre dışı bırakıldı, boş veri döndürülüyor.');
  return [];
};

// Epic Games API - İndirimli oyunlar (Devre dışı bırakıldı)
export const fetchDiscountedGames = async (): Promise<ExtendedEpicGame[]> => {
  // Gerçek API çağrısı yerine boş dizi döndür
  console.log('Epic API çağrıları devre dışı bırakıldı, boş veri döndürülüyor.');
  return [];
};

// Epic Games API - Oyun detayları (Devre dışı bırakıldı)
export const fetchGameDetails = async (slug: string): Promise<ExtendedEpicGame | null> => {
  // Gerçek API çağrısı yerine null döndür
  console.log('Epic API çağrıları devre dışı bırakıldı, boş veri döndürülüyor.');
  return null;
};

// Epic Games API - Oyunun doğru URL'sini al (Devre dışı bırakıldı)
export const getAccurateGameUrl = (game: ExtendedEpicGame, locale = 'tr'): string => {
  // Gerçek işlem yerine basit mantık kullan
  if (!game || !game.id) return '';
  
  // Yönlendirme kontrolü
  if (game.distributionPlatform?.toLowerCase() === 'steam') {
    return game.url || '';
  }
  
  // Varsayılan olarak GamerPower URL'sini kullan
  return game.url || '';
};

// Epic Games URL Düzeltici (Devre dışı bırakıldı)
export const fixGameUrl = (url: string, game?: ExtendedEpicGame): string => {
  // Gerçek işlem yerine doğrudan URL'yi döndür
  if (!url) return '';
  return url;
};

/**
 * Epic Store'da oyun URL'si oluşturur
 */
export const getEpicStoreUrl = (locale = 'tr'): string => {
  return 'https://store.epicgames.com/tr/browse';
};

/**
 * Epic Games URL ayarlayıcı  (devre dışı bırakıldı)
 */
export const getDynamicEpicUrl = (game: EpicGame, locale = 'tr'): string => {
  // Gerçek işlem yerine varsayılan bir URL döndür
  return `https://store.epicgames.com/${locale}/p/${game.urlSlug || game.productSlug || game.id}`;
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
      url: getDynamicEpicUrl(game)
    };
  } catch (error) {
    console.error('Epic oyun detaylarını getirme hatası:', error);
    return null;
  }
};

/**
 * GraphQL API ile oyun slug'ı için doğru URL bilgisini al
 * Gerekli durumlarda kullanılabilir
 */
async function getAccurateGameUrl(title: string, productSlug: string): Promise<string | null> {
  try {
    // İlk sorgu: slug'a göre sandboxId (namespace) bilgisi al
    const mappingResponse = await axios.get(
      `${EPIC_GRAPHQL_URL}?operationName=getMappingByPageSlug&variables=${encodeURIComponent(
        JSON.stringify({
          pageSlug: productSlug,
          locale: "tr-TR"
        })
      )}&extensions=${encodeURIComponent(
        JSON.stringify({
          persistedQuery: {
            version: 1,
            sha256Hash: MAPPING_QUERY_HASH
          }
        })
      )}`
    );

    const sandboxId = mappingResponse.data?.data?.StorePageMapping?.mapping?.sandboxId;
    if (!sandboxId) {
      console.warn(`GraphQL: ${title} için sandboxId bulunamadı`);
      return null;
    }

    // İkinci sorgu: offerId bilgisini al
    const catalogResponse = await axios.get(
      `${EPIC_GRAPHQL_URL}?operationName=getCatalogOffer&variables=${encodeURIComponent(
        JSON.stringify({
          locale: "tr-TR",
          country: "TR",
          offerId: "", // Bunu GQL API kendi buluyor
          sandboxId: sandboxId
        })
      )}&extensions=${encodeURIComponent(
        JSON.stringify({
          persistedQuery: {
            version: 1,
            sha256Hash: CATALOG_QUERY_HASH
          }
        })
      )}`
    );

    // Doğru slug bilgisini al
    const urlSlug = catalogResponse.data?.data?.Catalog?.catalogOffer?.urlSlug;
    if (urlSlug) {
      return `https://store.epicgames.com/tr/p/${urlSlug}`;
    }

    // Alternatif olarak productSlug bilgisini kontrol et
    const catalogOffer = catalogResponse.data?.data?.Catalog?.catalogOffer;
    if (catalogOffer && catalogOffer.productSlug) {
      const cleanSlug = catalogOffer.productSlug.split('/').pop() || catalogOffer.productSlug;
      return `https://store.epicgames.com/tr/p/${cleanSlug}`;
    }

    console.warn(`GraphQL: ${title} için doğru URL bulunamadı`);
    return null;
  } catch (error) {
    console.error(`GraphQL API hatası (${title}):`, error);
    return null;
  }
} 