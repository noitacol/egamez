import type { NextApiRequest, NextApiResponse } from 'next';
import { getFreeGames, getTemporaryFreeEpicGames } from '../../lib/epic-api';
import { getFreeSteamGames, getTemporaryFreeSteamGames, convertSteamToEpicFormat } from '../../lib/steam-api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check parametresi kontrol edilir
    const checkParam = req.query.check as string;
    
    // Sadece geçici ücretsiz oyunları kontrol et
    if (checkParam === 'temporary') {
      console.log('Günlük geçici ücretsiz oyun kontrolü: ' + new Date().toISOString());
      
      // Epic Games'den geçici ücretsiz oyunları al
      const tempFreeEpicGames = await getTemporaryFreeEpicGames();
      
      // Steam'den geçici ücretsiz oyunları al
      const tempFreeSteamGames = await getTemporaryFreeSteamGames();
      const tempFreeSteamGamesFormatted = tempFreeSteamGames.map(game => convertSteamToEpicFormat(game));
      
      // Tüm geçici ücretsiz oyunları birleştir
      const allTempFreeGames = [
        ...tempFreeEpicGames,
        ...tempFreeSteamGamesFormatted
      ];
      
      // Günlük kontrol için zaman bilgisi
      const lastUpdated = new Date().toISOString();
      
      res.status(200).json({
        temporaryFreeGames: allTempFreeGames,
        lastUpdated,
        totalCount: allTempFreeGames.length,
        sources: {
          epic: tempFreeEpicGames.length,
          steam: tempFreeSteamGames.length
        },
        type: 'daily-check'
      });
      
      return;
    }
    
    // Tüm ücretsiz oyunlar için normal akış
    // Epic Games'den ücretsiz oyunları al
    const epicFreeGames = await getFreeGames();
    
    // Epic Games'den geçici ücretsiz oyunları al
    const tempFreeEpicGames = await getTemporaryFreeEpicGames();
    
    // Steam'den ücretsiz oyunları al
    const steamFreeGames = await getFreeSteamGames();
    const steamFreeGamesFormatted = steamFreeGames.map(game => convertSteamToEpicFormat(game));
    
    // Steam'den geçici ücretsiz oyunları al
    const tempFreeSteamGames = await getTemporaryFreeSteamGames();
    const tempFreeSteamGamesFormatted = tempFreeSteamGames.map(game => convertSteamToEpicFormat(game));
    
    // Tüm ücretsiz oyunları birleştir
    const allFreeGames = [
      ...epicFreeGames.map(game => ({ ...game, source: 'epic' })),
      ...steamFreeGamesFormatted
    ];
    
    // Tüm geçici ücretsiz oyunları birleştir
    const allTempFreeGames = [
      ...tempFreeEpicGames,
      ...tempFreeSteamGamesFormatted
    ];
    
    // Günlük kontrol için zaman bilgisi
    const lastUpdated = new Date().toISOString();
    
    // 30 dakika için önbelleğe alma, ISR için
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=1800, stale-while-revalidate=3600'
    );
    
    res.status(200).json({ 
      freeGames: allFreeGames,
      temporaryFreeGames: allTempFreeGames,
      lastUpdated,
      totalCount: allFreeGames.length + allTempFreeGames.length,
      sources: {
        epic: {
          regular: epicFreeGames.length,
          temporary: tempFreeEpicGames.length
        },
        steam: {
          regular: steamFreeGames.length,
          temporary: tempFreeSteamGames.length
        }
      }
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Ücretsiz oyunları çekerken bir hata oluştu' });
  }
} 