/**
 * Epic Games oyun tip tanımı
 */
export interface EpicGame {
  id: string;
  namespace?: string;
  title: string;
  description?: string;
  offerType?: string;
  expiryDate?: string | null;
  effectiveDate?: string | null;
  status?: string;
  isCodeRedemptionOnly?: boolean;
  keyImages?: Array<{
    type: string;
    url: string;
  }>;
  seller?: {
    id: string;
    name: string;
  };
  productSlug?: string;
  urlSlug?: string;
  url?: string | null;
  items?: Array<{
    id: string;
    namespace: string;
  }>;
  customAttributes?: Array<{
    key: string;
    value: string;
  }>;
  categories?: Array<{
    path: string;
    name: string;
  }>;
  price?: {
    totalPrice: {
      discountPrice: number;
      originalPrice: number;
      voucherDiscount?: number;
      discount?: number;
      currencyCode?: string;
      currencyInfo?: {
        decimals: number;
      };
      fmtPrice?: {
        originalPrice: string;
        discountPrice: string;
        intermediatePrice?: string;
      };
    };
  };
  promotions?: {
    promotionalOffers?: Array<{
      promotionalOffers: Array<{
        startDate: string;
        endDate: string;
        discountSetting: {
          discountType: string;
          discountPercentage: number;
        };
      }>;
    }>;
    upcomingPromotionalOffers?: Array<{
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

/**
 * Epic Games ve diğer platformlar için genişletilmiş tip tanımı
 * Temel EpicGame tipine ek özellikler ekler
 */
export interface ExtendedEpicGame extends Omit<EpicGame, 'categories' | 'isCodeRedemptionOnly' | 'offerType'> {
  /** Oyun verisinin kaynağı */
  source?: 'epic' | 'steam' | 'gamerpower' | 'custom';
  
  /** Kaynak etiketi (görünür metin) */
  sourceLabel?: string;
  
  /** Dağıtım platformu */
  distributionPlatform?: string;
  
  /** Desteklenen platformlar */
  platform?: string;
  
  /** Oyun ücretsiz mi? */
  isFree?: boolean;
  
  /** Oyun yakında ücretsiz mi olacak? */
  isUpcoming?: boolean;
  
  /** Oyun indirimde mi? */
  isOnSale?: boolean;
  
  /** Oyun loot mu? */
  isLoot?: boolean;
  
  /** Oyun beta mı? */
  isBeta?: boolean;
  
  /** Sadece kupon kodu ile mi kullanılabilir - EpicGame'den override ediyoruz */
  isCodeRedemptionOnly?: boolean;
  
  /** Kalan indirim süresi (milisaniye) */
  timeLeft?: number;
  
  /** Oyun için hesaplanmış ölçek */
  scale?: string;
  
  /** Promosyon tipi - EpicGame'den override ediyoruz */
  offerType?: string | 'free' | 'loot' | 'beta';
  
  /** Oyun süresi */
  worth?: string;
  
  /** CPU gereksinimleri */
  minimumCPU?: string;
  
  /** RAM gereksinimleri */
  minimumRAM?: string;
  
  /** Disk alanı gereksinimleri */
  minimumStorage?: string;
  
  /** Ekran kartı gereksinimleri */
  minimumGraphics?: string;
  
  /** İşletim sistemi gereksinimleri */
  minimumOS?: string;
  
  /** Oyun değerlendirme puanı (100 üzerinden) */
  score?: number;
  
  /** Oyun değerlendirmesi (örn: "Çok Olumlu", "Karma") */
  gameRating?: string;
  
  /** Yanıt sayısı */
  responseCount?: number;

  /** Video içerikleri */
  videos?: {
    url: string;
    type?: string;
    thumbnailUrl?: string;
  }[];
  
  /** Ekran görüntüleri */
  screenshots?: {
    url: string;
    id?: string;
    thumbnailUrl?: string;
  }[];
  
  /** Steam için header görseli */
  headerImage?: string;
  
  /** Kategoriler - EpicGame'den devraldık ancak override ediyoruz */
  categories?: string[] | { path: string; name: string }[];
  
  /** Oyun türleri */
  genres?: {
    id: string;
    name: string;
  }[];
  
  /** Oyuncu sayısı */
  players?: string;
  
  /** Metacritic puanı */
  metacritic?: {
    score: number;
    url: string;
  };
}

/**
 * API filtreleme seçenekleri
 */
export interface GameFilterOptions {
  source?: string;
  platform?: string;
  type?: string;
  sortBy?: string;
}

/**
 * API yanıt formatı
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  count: number;
  data: T[];
  error?: string;
}

// Dağıtım platformları
export type DistributionPlatform = 'epic' | 'steam' | 'gamerpower' | string;

// Fiyat formatı
export interface FormattedPrice {
  originalPrice: string;
  discountPrice: string;
  intermediatePrice: string;
}

// Para birimi bilgisi
export interface CurrencyInfo {
  decimals: number;
}

// Toplam fiyat
export interface TotalPrice {
  discountPrice: number;
  originalPrice: number;
  voucherDiscount?: number;
  discount: number;
  currencyCode?: string;
  currencyInfo?: CurrencyInfo;
  fmtPrice?: FormattedPrice;
}

// Fiyat bilgisi
export interface Price {
  totalPrice: {
    discountPrice: number;
    originalPrice: number;
    voucherDiscount?: number;
    discount?: number;
    currencyCode?: string;
    currencyInfo?: {
      decimals: number;
    };
    fmtPrice?: {
      originalPrice: string;
      discountPrice: string;
      intermediatePrice?: string;
    };
  };
} 