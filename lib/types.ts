import { EpicGame } from './epic-api';

/**
 * Epic Games ve diğer platformlar için genişletilmiş tip tanımı
 * Temel EpicGame tipine ek özellikler ekler
 */
export interface ExtendedEpicGame extends Omit<EpicGame, 'categories' | 'isCodeRedemptionOnly' | 'offerType'> {
  /** Oyunun kaynağı (epic, steam vs.) */
  source?: string;
  
  /** Kaynak için gösterilecek etiket */
  sourceLabel?: string;
  
  /** Oyunun yayınlandığı platform */
  platform?: string;
  
  /** Dağıtım platformu (epic, steam, xbox, playstation vs.) */
  distributionPlatform?: 'epic' | 'steam' | 'xbox' | 'playstation' | 'nintendo' | 'pc' | 'android' | 'ios' | 'other' | string;
  
  /** Ücretsiz olup olmadığı */
  isFree?: boolean;
  
  /** Yakında ücretsiz olacak mı */
  isUpcoming?: boolean;
  
  /** Popüler/trend mi */
  isTrending?: boolean;
  
  /** İndirimde mi */
  isOnSale?: boolean;
  
  /** Sadece kupon kodu ile mi kullanılabilir - EpicGame'den override ediyoruz */
  isCodeRedemptionOnly?: boolean;
  
  /** Oyun içi ekstra içerik mi (skin, DLC vs.) */
  isLoot?: boolean;
  
  /** Beta test için mi */
  isBeta?: boolean;
  
  /** Promosyon tipi - EpicGame'den override ediyoruz */
  offerType?: string;
  
  /** Promosyon bitiş tarihi */
  endDate?: string | null;
  
  /** Oyunun URL'si */
  url: string | null;
  
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
  
  /** Platformların listesi */
  platformList?: string[];
  
  /** Harici kaynaklardan gelen oyunun orijinal değeri (örn. $19.99) */
  worth?: string;
  
  /** Kategoriler - EpicGame'den devraldık ancak override ediyoruz */
  categories?: {
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