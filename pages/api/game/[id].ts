import type { NextApiRequest, NextApiResponse } from 'next';
import { getGameDetails } from '../../../lib/epic-api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Geçerli bir oyun ID'si belirtilmedi' });
  }
  
  try {
    const game = await getGameDetails(id);
    
    if (!game) {
      return res.status(404).json({ error: 'Oyun bulunamadı' });
    }
    
    // 30 dakika için önbelleğe alma, ISR için
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=1800, stale-while-revalidate=3600'
    );
    
    res.status(200).json(game);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Oyun detaylarını çekerken bir hata oluştu' });
  }
} 