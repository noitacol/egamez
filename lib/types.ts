import { EpicGame } from './epic-api';

/**
 * Epic Games ve diğer platformlar için genişletilmiş tip tanımı
 * Temel EpicGame tipine ek özellikler ekler
 */
export interface ExtendedEpicGame extends EpicGame {
  /** Oyunun kaynağı (epic, gamerpower vs.) */
  source?: string;
  
  /** Oyunun yayınlandığı platform */
  platform?: string;
  
  /** Dağıtım platformu (epic, gamerpower vs.) */
  distributionPlatform?: 'epic' | 'gamerpower' | string;
  
  /** Ücretsiz olup olmadığı */
  isFree?: boolean;
  
  /** Yakında ücretsiz olacak mı */
  isUpcoming?: boolean;
  
  /** Popüler/trend mi */
  isTrending?: boolean;
  
  /** İndirimde mi */
  isOnSale?: boolean;
  
  /** Sadece kupon kodu ile mi kullanılabilir */
  isCodeRedemptionOnly?: boolean;
  
  /** Promosyon tipi */
  offerType?: string;
  
  /** Promosyon bitiş tarihi */
  endDate?: string | null;
  
  /** Oyunun URL'si */
  url?: string;
  
  /** Mağaza URL'si */
  storeUrl?: string;
  
  /** Oyunun yayıncısı */
  publisher?: string;
  
  /** MetaCritic puanı */
  metacritic?: {
    score: number;
    url: string;
  } | null;
  
  /** Oyunun videoları */
  videos?: Array<{
    url: string;
    thumbnail?: string;
    type?: string;
  }>;
  
  /** İlgili platform için App ID */
  platformAppId?: string;
  
  /** Steam için App ID */
  steamAppId?: string;
  
  /** Başlık resmi */
  headerImage?: string;
  
  /** Ekran görüntüleri */
  screenshots?: Array<{
    url: string;
    type?: string;
  }>;
  
  /** Hangi platformlarda çalıştığı */
  platformName?: string;
  
  /** Geçici ücretsiz oyun mu */
  temporaryFreeGame?: boolean;
  
  /** Kategoriler - EpicGame'in categories tipini override eder */
  categories: {
    path: string;
    name: string;
  }[];
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
  totalPrice: TotalPrice;
} 