import type { NextApiRequest, NextApiResponse } from 'next';
// Epic API çağrıları geçici olarak devre dışı bırakıldı
// import { fetchUpcomingFreeGames } from '@/lib/epic-api';
import { ExtendedEpicGame } from '@/lib/types';

interface ApiResponse {
  status: string;
  message: string;
  data: ExtendedEpicGame[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Epic API devre dışı bırakıldı, boş veri döndürülüyor
    console.log('Epic API çağrıları devre dışı bırakıldı, boş veri döndürülüyor.');
    
    // 30 dakika için önbelleğe alma, ISR için
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=1800, stale-while-revalidate=3600'
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Şu anda Epic API devre dışı bırakıldı.',
      data: []
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Bir hata oluştu',
      data: []
    });
  }
} 