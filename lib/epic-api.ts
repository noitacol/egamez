import axios from 'axios';
import { ExtendedEpicGame } from './types';

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

// API URL'leri - statik derleme sırasında tam URL kullanılır
const isServer = typeof window === 'undefined';
const BASE_URL = isServer 
  ? 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions' 
  : '/api/epic-store';
const EPIC_API_URL = `${BASE_URL}${isServer ? '?locale=tr-TR&country=TR&allowCountries=TR' : '?locale=tr-TR&country=TR&allowCountries=TR'}`;

/**
 * Epic Games'ten ücretsiz oyunları getirir
 */
export const fetchFreeGames = async (): Promise<ExtendedEpicGame[]> => {
  try {
    const response = await axios.get(EPIC_API_URL);

    // API yanıtındaki tüm oyun verilerini konsola yazdır
    console.log("Epic API Oyun Verileri:", JSON.stringify(response.data.data.Catalog.searchStore.elements, null, 2));

    const games = response.data.data.Catalog.searchStore.elements;
    
    // Şu anda ücretsiz olan oyunları filtrele
    const freeGames = games.filter((game: EpicGame) => {
      const { promotionalOffers } = game.promotions || { promotionalOffers: [] };
      return promotionalOffers && promotionalOffers.length > 0;
    });

    // URL'leri düzelt ve oyunları döndür
    return freeGames.map((game: EpicGame) => {
      console.log(`Oyun Bilgileri:
      - ID: ${game.id}
      - Başlık: ${game.title}
      - productSlug: ${game.productSlug || 'YOK'}
      - urlSlug: ${game.urlSlug || 'YOK'}
      - URL: ${game.url || 'YOK'}
      - Satıcı: ${game.seller?.name || 'YOK'}
      `);
      
      // Oyun bilgilerini genişlet
      const extendedGame: ExtendedEpicGame = {
        ...game,
        source: 'epic',
        sourceLabel: 'Epic Games',
        distributionPlatform: 'epic',
        isFree: true,
        isOnSale: false,
        platform: 'PC',
        url: getDynamicEpicUrl(game) // Doğru URL'yi belirle
      };
      
      console.log(`Oluşturulan URL: ${extendedGame.url}`);
      
      return extendedGame;
    });
  } catch (error) {
    console.error('Epic ücretsiz oyunları getirme hatası:', error);
    return [];
  }
};

/**
 * Epic Games Store için gerçek URL'yi dinamik olarak belirler
 */
const getDynamicEpicUrl = (game: EpicGame | Partial<ExtendedEpicGame>): string => {
  // Epic Games URL için temel domain
  const BASE_URL = 'https://store.epicgames.com';
  
  try {
    // 1. Direkt API'den alınan URL'yi kullan (TR dilini ayarla)
    if (game.url && typeof game.url === 'string') {
      // URL'yi Türkçe dil ayarına sahip olacak şekilde düzenle
      const parsedUrl = new URL(game.url);
      
      // Epic Store URL değilse atla
      if (!parsedUrl.hostname.includes('epicgames.com')) {
        throw new Error('Epic Store URL değil');
      }
      
      // Değiştirilmiş URL oluştur (Dil: TR)
      return `${BASE_URL}/tr${parsedUrl.pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/i, '')}`;
    }
    
    // 2. Eğer ulrSlug varsa kullan (Epic Store'un tercih ettiği format)
    if (game.urlSlug && typeof game.urlSlug === 'string') {
      return `${BASE_URL}/tr/p/${game.urlSlug}`;
    }
    
    // 3. productSlug kullan (sonunda sayı/kod varsa olduğu gibi koru)
    if (game.productSlug && typeof game.productSlug === 'string') {
      // Eğer birden fazla parça varsa son parçayı al (/home/games/abc -> abc)
      // Ancak son parçada özel formatlama varsa (ör: game-name--343433) bunu bölme
      const lastPart = game.productSlug.split('/').pop() || '';
      return `${BASE_URL}/tr/p/${lastPart}`;
    }
    
    // 4. Başlığı kullanarak URL oluştur
    if (game.title && typeof game.title === 'string') {
      const slugifiedTitle = game.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      return `${BASE_URL}/tr/p/${slugifiedTitle}`;
    }
    
    // 5. Son çare: ID'yi kullanarak genel Epic Mağaza sayfası
    if (game.id) {
      // UUID formatını kullanabilen alternatif bir URL biçimi
      return `${BASE_URL}/tr/browse?q=${encodeURIComponent(game.title || '')}`;
    }
  } catch (error) {
    console.error(`URL oluşturma hatası (${game.title}):`, error);
  }
  
  // Başarısızlık durumunda genel Epic Store ana sayfası
  return `${BASE_URL}/tr/browse`;
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

    // URL'leri düzelt ve oyunları döndür
    return upcomingFreeGames.map((game: EpicGame) => {
      console.log(`Upcoming Oyun Bilgileri:
      - ID: ${game.id}
      - Başlık: ${game.title}
      - productSlug: ${game.productSlug || 'YOK'}
      - urlSlug: ${game.urlSlug || 'YOK'}
      - URL: ${game.url || 'YOK'}
      - Satıcı: ${game.seller?.name || 'YOK'}
      `);
      
      // Oyun bilgilerini genişlet
      const extendedGame: ExtendedEpicGame = {
        ...game,
        source: 'epic',
        sourceLabel: 'Epic Games',
        distributionPlatform: 'epic',
        isFree: false,
        isUpcoming: true,
        isOnSale: false,
        platform: 'PC',
        url: getDynamicEpicUrl(game) // Doğru URL'yi belirle
      };
      
      console.log(`Oluşturulan URL: ${extendedGame.url}`);
      
      return extendedGame;
    });
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
      url: getDynamicEpicUrl(game)
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