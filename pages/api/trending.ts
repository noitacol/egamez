import { NextApiRequest, NextApiResponse } from 'next';
import { getTrendingSteamGames } from '@/lib/steam-api';
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
    const { limit = 10 } = req.query;
    
    // Trend olan Steam oyunlarını al
    const trendingGames = await getTrendingSteamGames(Number(limit) || 10);
    
    // Başarılı yanıt döndür
    return res.status(200).json({
      status: 'success',
      count: trendingGames.length,
      data: trendingGames
    });
  } catch (error) {
    console.error('Error fetching trending games:', error);
    
    // Hata durumunda hata yanıtı döndür
    return res.status(500).json({
      status: 'error',
      count: 0,
      data: [],
      error: 'Trend olan oyunlar alınırken bir hata oluştu'
    });
  }
} 