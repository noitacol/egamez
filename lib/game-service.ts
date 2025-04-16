import { EpicGame, getFreeGames, getUpcomingFreeGames, getTemporaryFreeEpicGames, getGameDetails as getEpicGameDetails } from './epic-api';
import { getFreeSteamGames, getTrendingSteamGames, getTemporaryFreeSteamGames, convertSteamToEpicFormat, getGameDetails as getSteamGameDetails, SteamGame } from './steam-api';

export interface GameServiceOptions {
  includeFree?: boolean;
  includeUpcoming?: boolean;
  includeTemporary?: boolean;
  includeTrending?: boolean;
  filterSource?: 'epic' | 'steam' | 'all';
  limit?: number;
  sortBy?: 'title' | 'date' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface GameServiceResult {
  freeGames: EpicGame[];
  upcomingFreeGames: EpicGame[];
  temporaryFreeGames: EpicGame[];
  trendingGames: EpicGame[];
  lastUpdated: string;
  totalCount: number;
  sources: {
    epic: {
      free: number;
      upcoming: number;
      temporary: number;
      trending: number;
    };
    steam: {
      free: number;
      temporary: number;
      trending: number;
    };
  };
}

// Varsayılan game service options
const defaultOptions: GameServiceOptions = {
  includeFree: true,
  includeUpcoming: false,
  includeTemporary: true,
  includeTrending: false,
  filterSource: 'all',
  limit: 50,
  sortBy: 'title',
  sortOrder: 'asc'
};

/**
 * Epic Games ve Steam verilerini birleştiren ana servis fonksiyonu
 */
export async function getAllGames(options: GameServiceOptions = {}): Promise<GameServiceResult> {
  // Varsayılan ayarları kullanıcının ayarları ile birleştir
  const opts = { ...defaultOptions, ...options };
  
  // Sonuç objesi
  const result: GameServiceResult = {
    freeGames: [],
    upcomingFreeGames: [],
    temporaryFreeGames: [],
    trendingGames: [],
    lastUpdated: new Date().toISOString(),
    totalCount: 0,
    sources: {
      epic: {
        free: 0,
        upcoming: 0,
        temporary: 0,
        trending: 0
      },
      steam: {
        free: 0,
        temporary: 0,
        trending: 0
      }
    }
  };

  try {
    // Paralel olarak tüm verileri çekiyoruz
    const tasks: Promise<any>[] = [];
    
    // Epic Games ücretsiz oyunlarını çek
    if (opts.includeFree && (opts.filterSource === 'all' || opts.filterSource === 'epic')) {
      tasks.push(
        getFreeGames().then(games => {
          const epicFreeGames = games.map(game => ({ ...game, source: 'epic' as const }));
          result.freeGames.push(...epicFreeGames);
          result.sources.epic.free = epicFreeGames.length;
        })
      );
    }
    
    // Epic Games'in gelecekte ücretsiz olacak oyunlarını çek
    if (opts.includeUpcoming && (opts.filterSource === 'all' || opts.filterSource === 'epic')) {
      tasks.push(
        getUpcomingFreeGames().then(games => {
          const upcomingGames = games.map(game => ({ ...game, source: 'epic' as const }));
          result.upcomingFreeGames.push(...upcomingGames);
          result.sources.epic.upcoming = upcomingGames.length;
        })
      );
    }
    
    // Epic Games'in geçici ücretsiz oyunlarını çek
    if (opts.includeTemporary && (opts.filterSource === 'all' || opts.filterSource === 'epic')) {
      tasks.push(
        getTemporaryFreeEpicGames().then(games => {
          const tempGames = games.map(game => ({ ...game, source: 'epic' as const }));
          result.temporaryFreeGames.push(...tempGames);
          result.sources.epic.temporary = tempGames.length;
        })
      );
    }
    
    // Steam'in ücretsiz oyunlarını çek
    if (opts.includeFree && (opts.filterSource === 'all' || opts.filterSource === 'steam')) {
      tasks.push(
        getFreeSteamGames().then(games => {
          const steamFreeGames = games.map(game => convertSteamToEpicFormat({ ...game, source: 'steam' }));
          result.freeGames.push(...steamFreeGames);
          result.sources.steam.free = steamFreeGames.length;
        })
      );
    }
    
    // Steam'in geçici ücretsiz oyunlarını çek
    if (opts.includeTemporary && (opts.filterSource === 'all' || opts.filterSource === 'steam')) {
      tasks.push(
        getTemporaryFreeSteamGames().then(games => {
          const tempSteamGames = games.map(game => convertSteamToEpicFormat({ ...game, source: 'steam' }));
          result.temporaryFreeGames.push(...tempSteamGames);
          result.sources.steam.temporary = tempSteamGames.length;
        })
      );
    }
    
    // Steam'in trend oyunlarını çek
    if (opts.includeTrending && (opts.filterSource === 'all' || opts.filterSource === 'steam')) {
      tasks.push(
        getTrendingSteamGames().then(games => {
          const trendingSteamGames = games.map(game => convertSteamToEpicFormat({ ...game, source: 'steam' }));
          result.trendingGames.push(...trendingSteamGames);
          result.sources.steam.trending = trendingSteamGames.length;
        })
      );
    }
    
    // Tüm veri çekme işlemlerinin tamamlanmasını bekle
    await Promise.all(tasks);
    
    // Sıralama işlemini gerçekleştir
    const sortGames = (games: EpicGame[]) => {
      return [...games].sort((a, b) => {
        let compareResult = 0;
        
        if (opts.sortBy === 'title') {
          compareResult = a.title.localeCompare(b.title);
        } else if (opts.sortBy === 'date') {
          compareResult = new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime();
        } else if (opts.sortBy === 'price') {
          const aPrice = a.price?.totalPrice?.discountPrice || 0;
          const bPrice = b.price?.totalPrice?.discountPrice || 0;
          compareResult = aPrice - bPrice;
        }
        
        return opts.sortOrder === 'desc' ? -compareResult : compareResult;
      }).slice(0, opts.limit);
    };
    
    // Sıralama ve limit uygula
    result.freeGames = sortGames(result.freeGames);
    result.upcomingFreeGames = sortGames(result.upcomingFreeGames);
    result.temporaryFreeGames = sortGames(result.temporaryFreeGames);
    result.trendingGames = sortGames(result.trendingGames);
    
    // Toplam oyun sayısını güncelle
    result.totalCount = 
      result.freeGames.length + 
      result.upcomingFreeGames.length + 
      result.temporaryFreeGames.length + 
      result.trendingGames.length;
    
    return result;
  } catch (error) {
    console.error('Game service error:', error);
    return result; // Hata durumunda boş sonuç döndür
  }
}

/**
 * Belirli bir oyunun detaylarını kaynağına göre çeker
 */
export async function getGameDetails(id: string, source: 'epic' | 'steam'): Promise<EpicGame | null> {
  try {
    if (source === 'epic') {
      return await getEpicGameDetails(id);
    } else if (source === 'steam') {
      // Steam ID'leri 'steam_123456' formatında olabilir, prefix'i kaldır
      const steamId = id.startsWith('steam_') ? id.replace('steam_', '') : id;
      const steamGame = await getSteamGameDetails(parseInt(steamId, 10));
      if (steamGame) {
        return convertSteamToEpicFormat(steamGame);
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${source} game details:`, error);
    return null;
  }
}

/**
 * Otomatik veri yenileme için kullanılabilecek fonksiyon
 * Bu fonksiyon her çağrıldığında en güncel oyun verilerini çeker
 */
export async function refreshGameData(): Promise<GameServiceResult> {
  console.log('Oyun verileri güncelleniyor: ' + new Date().toISOString());
  
  // Tüm verileri çek
  const result = await getAllGames({
    includeFree: true,
    includeUpcoming: true,
    includeTemporary: true,
    includeTrending: true,
    limit: 100
  });
  
  console.log(`Veri yenileme tamamlandı. Toplam ${result.totalCount} oyun bulundu.`);
  return result;
}

/**
 * Oyunları belirli kriterlere göre arama yapabilen fonksiyon
 */
export async function searchGames(query: string, options: GameServiceOptions = {}): Promise<EpicGame[]> {
  const allGamesData = await getAllGames(options);
  
  // Tüm oyun listelerini birleştir
  const allGames = [
    ...allGamesData.freeGames,
    ...allGamesData.upcomingFreeGames,
    ...allGamesData.temporaryFreeGames,
    ...allGamesData.trendingGames
  ];
  
  // Arama sorgusu boşsa tüm oyunları döndür
  if (!query.trim()) {
    return allGames;
  }
  
  // Arama sorgusuna göre filtreleme yap
  const lowercaseQuery = query.toLowerCase();
  return allGames.filter(game => 
    game.title.toLowerCase().includes(lowercaseQuery) || 
    (game.description?.toLowerCase().includes(lowercaseQuery))
  );
} 