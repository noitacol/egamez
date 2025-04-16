import type { NextApiRequest, NextApiResponse } from 'next';
import { getFreeGames } from '../../lib/epic-api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const games = await getFreeGames();
    
    // 30 dakika için önbelleğe alma, ISR için
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=1800, stale-while-revalidate=3600'
    );
    
    res.status(200).json({ games });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Ücretsiz oyunları çekerken bir hata oluştu' });
  }
} 