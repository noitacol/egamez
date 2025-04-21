import { NextApiRequest, NextApiResponse } from 'next';
import { fetchFreeGames } from '@/lib/epic-api';
import {
  getFreeGamerPowerGames,
  getGamerPowerGamesByPlatform,
  getGamerPowerGamesByType,
  getGamerPowerGamesSorted,
  getFilteredGamerPowerGames,
  convertGamerPowerToEpicFormat
} from '@/lib/gamerpower-api';
import { getFreeSteamGames } from '@/lib/steam-api';
import { ExtendedEpicGame } from '@/lib/types';

// API sonuç tipi tanımı
interface ApiResponse {
  status: 'success' | 'error';
  count: number;
  data: ExtendedEpicGame[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const {
      source = 'all',
      platform,
      type,
      sortBy
    } = req.query;

    // Ücretsiz oyunları al
    let epicGames: ExtendedEpicGame[] = [];
    let externalGames: ExtendedEpicGame[] = [];
    let steamGames: ExtendedEpicGame[] = [];

    // Sorgu parametrelerine göre veri getir
    if (source === 'all' || source === 'epic') {
      epicGames = await fetchFreeGames() || [];
      
      // Epic oyunlarına kaynak bilgisi ekle
      epicGames = epicGames.map(game => ({
        ...game,
        source: 'epic',
        platform: 'epic',
        distributionPlatform: 'epic',
        sourceLabel: 'Epic Store'
      }));
    }

    if (source === 'all' || source === 'steam') {
      steamGames = await getFreeSteamGames() || [];
      
      // Steam oyunlarına kaynak bilgisi ekle
      steamGames = steamGames.map(game => ({
        ...game,
        source: 'steam',
        sourceLabel: 'Steam'
      }));
    }

    if (source === 'all' || source === 'external') {
      // Harici platform filtre parametreleri varsa gelişmiş filtreleme yap
      if (platform || type || sortBy) {
        const validSortBy = ['date', 'value', 'popularity'].includes(String(sortBy))
          ? (String(sortBy) as 'date' | 'value' | 'popularity')
          : undefined;
        
        externalGames = await getFilteredGamerPowerGames(
          type ? String(type) : undefined,
          platform ? String(platform) : undefined,
          validSortBy
        );
        
        // Harici kaynak bilgilerini güncelle
        externalGames = externalGames.map(game => ({
          ...game,
          source: 'external',
          sourceLabel: 'Ücretsiz'
        }));
      } else {
        // Filtre yoksa tüm ücretsiz oyunları getir
        const freeGames = await getFreeGamerPowerGames();
        externalGames = freeGames.map(game => {
          const converted = convertGamerPowerToEpicFormat(game);
          return {
            ...converted,
            source: 'external',
            sourceLabel: 'Ücretsiz'
          };
        });
      }
    }

    // Tüm oyunları birleştir
    const allGames = [...epicGames, ...externalGames, ...steamGames];
    
    // Sıralama kriterine göre sırala
    if (sortBy) {
      if (sortBy === 'name') {
        allGames.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'date') {
        allGames.sort((a, b) => {
          const dateA = a.effectiveDate ? new Date(a.effectiveDate).getTime() : 0;
          const dateB = b.effectiveDate ? new Date(b.effectiveDate).getTime() : 0;
          return dateB - dateA; // Yeniden eskiye sıralama
        });
      }
    }

    // Başarılı yanıt döndür
    return res.status(200).json({
      status: 'success',
      count: allGames.length,
      data: allGames
    });
  } catch (error) {
    console.error('Error fetching free games:', error);
    
    // Hata durumunda hata yanıtı döndür
    return res.status(500).json({
      status: 'error',
      count: 0,
      data: [],
      error: 'Ücretsiz oyunlar alınırken bir hata oluştu'
    });
  }
} 