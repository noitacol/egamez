import { EpicGame } from './epic-api';

/**
 * EpicGame arayüzünü genişleten arayüz; Epic ve Steam'den gelen verileri birleştirmek için kullanılır
 */
export interface ExtendedEpicGame extends EpicGame {
  /**
   * Oyunun video içerikleri
   */
  videos?: {
    url: string;
    thumbnail?: string;
    id?: string | number;
  }[];
  
  /**
   * Metacritic puanı ve inceleme URL'si
   */
  metacritic?: {
    score: number;
    url?: string;
  };
  
  /**
   * Oyunun trend olma durumu
   */
  trending?: boolean;
  
  /**
   * Oyunun trend olma durumu (alternatif isim)
   */
  isTrending?: boolean;
  
  /**
   * Oyunun yakında ücretsiz olma durumu
   */
  isUpcoming?: boolean;
  
  /**
   * Oyunun sadece geçici olarak ücretsiz olma durumu
   */
  temporaryFree?: boolean;
  
  /**
   * Geçici olarak ücretsiz oyun
   */
  temporaryFreeGame?: boolean;
  
  /**
   * Geçici promosyonun bitiş tarihi
   */
  promotionEndDate?: string;
  
  /**
   * Oyunun hangi platformdan geldiği (epic veya steam)
   */
  platform?: 'epic' | 'steam';
  
  /**
   * Dağıtım platformu (epic veya steam)
   */
  distributionPlatform?: 'epic' | 'steam';
  
  /**
   * Katalog namespace
   */
  catalogNs?: {
    mappings?: { pageSlug: string }[];
  };
} 