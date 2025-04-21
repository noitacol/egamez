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
 * Oyun URL'sini düzelt ve optimize et
 */
const fixGameUrl = (game: EpicGame | ExtendedEpicGame): string => {
  // UUID/ID formatındaki oyunlar için özel eşleştirme tablosu
  const knownGameIds: Record<string, string> = {
    "3c32d774010245b6b1095ff2d3df6b2e": "fallout-3-game-of-the-year-edition",
    "1185abfe7c554a1e8c528aba37bf3d0f": "the-sims-4"
    // Zamanla daha fazla ID-slug eşleştirmesi eklenebilir
  };
  
  // URL'nin ID formatında olup olmadığını kontrol et
  const isUuidFormat = (path: string): boolean => {
    // UUID formatı: 8-4-4-4-12 karakter (32 karakter + 4 tire)
    // veya 32 karakterli hex ID'ler 
    return /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(path) || 
           /^[0-9a-f]{32}$/i.test(path);
  };
  
  // URL path'inden ID'yi çıkar
  const extractIdFromPath = (path: string): string | null => {
    // /tr/p/1185abfe7c554a1e8c528aba37bf3d0f formatından ID'yi çıkar
    const match = path.match(/\/p\/([0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12})/i) ||
                  path.match(/\/p\/([0-9a-f]{32})/i);
    return match ? match[1] : null;
  };
  
  try {
    // 1. Oyunun kendi ID'si bilinen ID'lerden biriyse, hemen eşleşen slug'ı kullan
    if (game.id && knownGameIds[game.id]) {
      return `https://store.epicgames.com/tr/p/${knownGameIds[game.id]}`;
    }
    
    // 2. URL halihazırda varsa kontrol et
    if (game.url && typeof game.url === 'string' && game.url.includes('store.epicgames.com')) {
      const parsedUrl = new URL(game.url);
      
      // URL'den ID'yi çıkar
      const idFromPath = extractIdFromPath(parsedUrl.pathname);
      
      // URL'de UUID/ID formatı varsa ve bilinen ID'lerden biriyse, eşleşen slug'ı kullan
      if (idFromPath && knownGameIds[idFromPath]) {
        return `https://store.epicgames.com/tr/p/${knownGameIds[idFromPath]}`;
      }
      
      // URL'nin path kısmı UUID formatında mı kontrol et
      const pathParts = parsedUrl.pathname.split('/');
      if (pathParts.length >= 3) {
        const possibleId = pathParts[pathParts.length - 1];
        if (isUuidFormat(possibleId) && knownGameIds[possibleId]) {
          return `https://store.epicgames.com/tr/p/${knownGameIds[possibleId]}`;
        }
      }
      
      // URL'yi Türkçe dil ayarına sahip olacak şekilde düzenle
      let newPathParts = parsedUrl.pathname.split('/');
      
      // URL'nin başında dil kodu olabilir (/en-US/, /en/ gibi)
      if (newPathParts.length > 1 && newPathParts[1].match(/^[a-z]{2}(-[A-Z]{2})?$/)) {
        // Dil kodunu atla
        newPathParts = ['', 'tr', ...newPathParts.slice(2)];
      } else {
        // Dil kodu yoksa ekle
        newPathParts = ['', 'tr', ...newPathParts.slice(1)];
      }
      
      // Path parçalarını birleştir
      const newPath = newPathParts.join('/');
      
      // GraphQL API kullanarak gerçek URL'yi almayı dene (arka planda çalışacak)
      if (game.id && game.productSlug) {
        getAccurateGameUrl(game.title || 'Bilinmeyen Oyun', game.productSlug)
          .then(accurateUrl => {
            if (accurateUrl) {
              console.log(`GraphQL API URL düzeltme (${game.title}): ${accurateUrl}`);
              // URL düzeltildiğinde bir sonraki kullanımda doğru URL dönecek
              if (game.url !== accurateUrl) {
                game.url = accurateUrl; // Referans üzerinden güncelle
              }
            }
          })
          .catch(error => {
            console.error(`GraphQL API URL sorgusu hatası (${game.title}):`, error);
          });
      }
      
      return `https://store.epicgames.com${newPath}`;
    }
    
    // 3. GraphQL API kullanarak gerçek URL'yi almayı dene
    if (game.id && game.productSlug) {
      // Bu çağrı asenkron olduğu için başlatacağız ancak beklemeyeceğiz
      // URL sonradan düzeltilecek
      getAccurateGameUrl(game.title || 'Bilinmeyen Oyun', game.productSlug)
        .then(accurateUrl => {
          if (accurateUrl) {
            console.log(`GraphQL API URL düzeltme (${game.title}): ${accurateUrl}`);
            // URL düzeltildiğinde bir sonraki kullanımda doğru URL dönecek
            if (game.url !== accurateUrl) {
              game.url = accurateUrl; // Referans üzerinden güncelle
            }
          }
        })
        .catch(error => {
          console.error(`GraphQL API URL sorgusu hatası (${game.title}):`, error);
        });
    }
    
    // 4. urlSlug kullanarak URL oluştur (Epic'in tercih ettiği format)
    if (game.urlSlug && typeof game.urlSlug === 'string') {
      return `https://store.epicgames.com/tr/p/${game.urlSlug}`;
    }
    
    // 5. productSlug kullanarak URL oluştur
    if (game.productSlug && typeof game.productSlug === 'string') {
      // Eğer slug'ın içinde "/" karakteri varsa, düzgün bir biçime getir
      const cleanSlug = game.productSlug.split('/').pop() || game.productSlug;
      return `https://store.epicgames.com/tr/p/${cleanSlug}`;
    }
    
    // 6. Başlığı slug'a dönüştürerek URL oluştur
    if (game.title && typeof game.title === 'string') {
      const slugifiedTitle = game.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      return `https://store.epicgames.com/tr/p/${slugifiedTitle}`;
    }
  } catch (error) {
    console.error(`URL oluşturma hatası (${game.title}):`, error);
  }
  
  // Son çare: Epic Games ana sayfasına yönlendir
  return 'https://store.epicgames.com/tr/browse';
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

    // URL'leri düzelt ve oyunları döndür
    return freeGames.map((game: EpicGame) => {
      // Oyun bilgilerini genişlet
      const extendedGame: ExtendedEpicGame = {
        ...game,
        source: 'epic',
        sourceLabel: 'Epic Games',
        distributionPlatform: 'epic',
        isFree: true,
        isOnSale: false,
        platform: 'PC',
        url: fixGameUrl(game) // Doğru URL'yi belirle
      };
      
      // Eğer oyun adı daha önce tespit edilen problemli URL'lere sahip olabilecek bir oyunsa,
      // URL'yi özel olarak kontrol et ve düzelt
      if (extendedGame.title && extendedGame.url && (
          extendedGame.title === "Firestone Online Idle RPG" ||
          // Burada diğer problemli oyun adları eklenebilir
          extendedGame.url.includes('/en-US/') // Yanlış dil koduna sahip URL'ler
      )) {
        console.log(`Özel URL kontrolü: ${extendedGame.title}`);
        // URL'yi tekrar sağlama amaçlı düzelt
        extendedGame.url = fixGameUrl(extendedGame);
      }
      
      return extendedGame;
    });
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

    // URL'leri düzelt ve oyunları döndür
    return upcomingFreeGames.map((game: EpicGame) => {
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
        url: fixGameUrl(game) // Doğru URL'yi belirle
      };
      
      // Eğer oyun adı daha önce tespit edilen problemli URL'lere sahip olabilecek bir oyunsa,
      // URL'yi özel olarak kontrol et ve düzelt
      if (extendedGame.title && extendedGame.url && (
          extendedGame.url.includes('/en-US/') || // Yanlış dil koduna sahip URL'ler
          !extendedGame.url.includes('/p/') // URL yapısında sorun olabilecek durumlar
      )) {
        console.log(`Özel URL kontrolü (Yakında): ${extendedGame.title}`);
        // URL'yi tekrar sağlama amaçlı düzelt
        extendedGame.url = fixGameUrl(extendedGame);
      }
      
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