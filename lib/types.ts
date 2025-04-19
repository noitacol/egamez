import { EpicGame } from './epic-api';
import { SteamGame } from './steam-api';

/**
 * Epic Games ve Steam oyunları için genişletilmiş tip tanımı
 * Temel EpicGame tipine ek özellikler ekler
 */
export interface ExtendedEpicGame extends EpicGame {
  /** Oyunun Steam veya Epic kaynaklı olduğunu belirtir */
  source?: string;
  
  /** Oyunun yayınlandığı platform */
  platform?: string;
  
  /** Dağıtım platformu (epic, steam, gamerpower vs.) */
  distributionPlatform?: 'epic' | 'steam' | 'gamerpower' | string;
  
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
  
  /** Steam App ID */
  steamAppId?: string;
  
  /** Steam başlık resmi */
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