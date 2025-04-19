import { EpicGame } from './epic-api';
import { SteamGame } from './steam-api';

/**
 * Epic Games ve Steam oyunları için genişletilmiş tip tanımı
 * Temel EpicGame tipine ek özellikler ekler
 */
export interface ExtendedEpicGame extends EpicGame {
  /** Oyunun Steam veya Epic mağazasından geldiğini belirtir */
  source?: 'epic' | 'steam' | 'gamerpower';
  
  /** Platformu belirtir (epic veya steam) */
  platform?: 'epic' | 'steam' | 'gamerpower';
  
  /** Dağıtım platformu */
  distributionPlatform?: 'epic' | 'steam' | 'gamerpower';
  
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
  videos?: {
    id: string | number;
    name?: string;
    url: string;
    thumbnail?: string;
  }[];
  
  /** Çıkış tarihi (ISO string) */
  releaseDate?: string | null;
  
  /** Oyunun arkaplan resmi */
  background_image?: string | null;
  
  /** Özel not veya açıklama */
  note?: string | null;
  
  /** Steam ile ilgili ekstra alanlar */
  screenshots?: {
    id: number | string;
    type: string;
    url: string;
  }[];
  
  /** Trend, geçici ücretsiz gibi özel işaretler */
  isTemporaryFree?: boolean;
  isDiscounted?: boolean;
  
  /** Tarih bilgileri */
  releaseYear?: number;
  endDate?: string;
  
  /** URL bilgileri */
  url?: string;
  
  /** GamerPower özellikleri */
  openGiveawayUrl?: string;
  instructions?: string;
  gamerPowerUrl?: string;
  status?: string;
  worthString?: string;
  type?: string;
} 