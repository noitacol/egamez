import axios from 'axios';
import { ExtendedEpicGame } from './types';

// Epic API tamamen devre dışı bırakıldı
console.log('Epic API çağrıları devre dışı bırakıldı, boş veri döndürülüyor.');

// Epic Games API - Ücretsiz oyunlar (Devre dışı bırakıldı)
export const fetchFreeGames = async (): Promise<ExtendedEpicGame[]> => {
  return [];
};

// Epic Games API - Yakında ücretsiz olacak oyunlar (Devre dışı bırakıldı)
export const fetchUpcomingFreeGames = async (): Promise<ExtendedEpicGame[]> => {
  return [];
};

// Epic Games API - Günümüzde çok oynanan oyunlar (Devre dışı bırakıldı)
export const fetchTrendingGames = async (): Promise<ExtendedEpicGame[]> => {
  return [];
};

// Epic Games API - İndirimli oyunlar (Devre dışı bırakıldı)
export const fetchDiscountedGames = async (): Promise<ExtendedEpicGame[]> => {
  return [];
};

// Epic Games API - Oyun detaylarını getirir (Devre dışı bırakıldı)
export const fetchGameDetails = async (id: string): Promise<ExtendedEpicGame | null> => {
  return null;
};

// Epic Games URL Düzeltici (Devre dışı bırakıldı)
export const fixGameUrl = (url: string, game?: ExtendedEpicGame): string => {
  if (!url) return '';
  return url;
};

// Epic Games Store URL'sini oluşturur (Devre dışı bırakıldı)
export const getEpicStoreUrl = (locale = 'tr'): string => {
  return 'https://store.epicgames.com/tr/browse';
};

// Epic Games URL'sini dinamik olarak oluşturur (Devre dışı bırakıldı)
export const getDynamicEpicUrl = (game: any, locale = 'tr'): string => {
  return '';
};

// Epic Games Oyun URL'si alma (Devre dışı bırakıldı)
export const getAccurateGameUrl = (game: ExtendedEpicGame, locale = 'tr'): string => {
  if (!game || !game.id) return '';
  return game.url || '';
}; 