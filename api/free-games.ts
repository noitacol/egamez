import { NextApiRequest, NextApiResponse } from 'next';
import { getFreeGames, getUpcomingFreeGames, getTrendingEpicGames } from '../lib/epic-api';
import { getFreeSteamGames, getTrendingSteamGames } from '../lib/steam-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { check } = req.query;
    
    // check=temporary parametresi gelirse trending ve temporary free kontrol et
    if (check === 'temporary') {
      const [epicTrending, steamTrending] = await Promise.all([
        getTrendingEpicGames(),
        getTrendingSteamGames(),
      ]);
      
      const allTrending = [...epicTrending, ...steamTrending];
      
      return res.status(200).json({
        success: true,
        count: allTrending.length,
        trending: allTrending
      });
    }
    
    // Normal istek - Hem free hem upcoming
    const [epicFree, steamFree, epicUpcoming] = await Promise.all([
      getFreeGames(),
      getFreeSteamGames(),
      getUpcomingFreeGames(),
    ]);
    
    const allFreeGames = [...epicFree, ...steamFree];
    
    return res.status(200).json({
      success: true,
      count: allFreeGames.length + epicUpcoming.length,
      freeGames: allFreeGames,
      upcomingGames: epicUpcoming
    });
  } catch (error) {
    console.error('Error fetching free games:', error);
    return res.status(500).json({
      success: false,
      message: 'Ücretsiz oyunlar alınırken bir hata oluştu',
      error: (error as Error).message
    });
  }
} 