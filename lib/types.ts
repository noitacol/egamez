import { EpicGame } from './epic-api';

/**
 * Epic Games ve Steam oyunları için genişletilmiş tip tanımı
 * Temel EpicGame tipine ek özellikler ekler
 */
export interface ExtendedEpicGame extends EpicGame {
  /** Oyunun Steam veya Epic mağazasından geldiğini belirtir */
  source?: 'epic' | 'steam';
  
  /** Platformu belirtir (epic veya steam) */
  platform?: 'epic' | 'steam';
  
  /** Dağıtım platformu */
  distributionPlatform?: 'epic' | 'steam';
  
  /** Oyunun geçici olarak ücretsiz olup olmadığını belirtir */
  isTempFree?: boolean;
  
  /** Geçici olarak ücretsiz oyun */
  temporaryFreeGame?: boolean;
  
  /** Promosyon bitiş tarihi */
  promotionEndDate?: string | null;
  
  /** Oyunun yakında ücretsiz olma durumu */
  isUpcoming?: boolean;
  
  /** Oyunun popüler olup olmadığını belirtir */
  isTrending?: boolean;
  
  /** Trend olma durumu (alternatif isim) */
  trending?: boolean;
  
  /** Katalog namespace bilgisi */
  catalogNs?: {
    mappings?: { pageSlug: string }[];
  };
  
  /** Metacritic puanı */
  metacritic?: {
    score: number;
    url: string;
  } | null;
  
  /** Oyun videoları */
  videos?: Array<{
    id: string;
    thumbnail: string;
    url: string;
  }>;
  
  /** Çıkış tarihi (ISO string) */
  releaseDate?: string | null;
  
  /** Oyunun arkaplan resmi */
  background_image?: string | null;
  
  /** Özel not veya açıklama */
  note?: string | null;
} 