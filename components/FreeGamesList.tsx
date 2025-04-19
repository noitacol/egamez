import { useState } from "react";
import GameCard from "./GameCard";
import { SiEpicgames, SiSteam } from "react-icons/si";
import { FaPlaystation, FaXbox, FaDesktop, FaGamepad, FaApple, FaAndroid } from "react-icons/fa";
import { ExtendedEpicGame } from "@/lib/types";

interface FreeGamesListProps {
  epicGames: ExtendedEpicGame[];
  steamGames: ExtendedEpicGame[];
  gamerPowerGames: ExtendedEpicGame[];
}

// Platform tiplerini tanımla
type PlatformType = "all" | "epic" | "steam" | "playstation" | "xbox" | "pc" | "mobile";

const FreeGamesList = ({ epicGames, steamGames, gamerPowerGames }: FreeGamesListProps) => {
  const [filter, setFilter] = useState<PlatformType>("all");
  const [sortBy, setSortBy] = useState<"name" | "release">("name");

  // Oyunları platformlarına göre grupla
  const groupGamesByPlatform = () => {
    // Tüm oyunları birleştir
    const allGames = [...epicGames, ...steamGames, ...gamerPowerGames];
    
    return {
      epic: allGames.filter(game => 
        game.distributionPlatform === 'epic' || 
        (game.source === 'epic') ||
        (game.platform?.toLowerCase().includes('epic'))
      ),
      
      steam: allGames.filter(game => 
        game.distributionPlatform === 'steam' || 
        (game.source === 'steam') ||
        (game.platform?.toLowerCase().includes('steam'))
      ),
      
      playstation: allGames.filter(game => 
        game.distributionPlatform === 'playstation' || 
        game.platform?.toLowerCase().includes('playstation') || 
        game.platform?.toLowerCase().includes('ps4') || 
        game.platform?.toLowerCase().includes('ps5')
      ),
      
      xbox: allGames.filter(game => 
        game.distributionPlatform === 'xbox' || 
        game.platform?.toLowerCase().includes('xbox')
      ),
      
      pc: allGames.filter(game => 
        (game.distributionPlatform === 'pc' && 
         !game.distributionPlatform?.toLowerCase().includes('steam') && 
         !game.distributionPlatform?.toLowerCase().includes('epic')) || 
        (game.platform?.toLowerCase().includes('pc') && 
         !game.platform?.toLowerCase().includes('steam') && 
         !game.platform?.toLowerCase().includes('epic') && 
         !game.platform?.toLowerCase().includes('xbox') && 
         !game.platform?.toLowerCase().includes('playstation'))
      ),
      
      mobile: allGames.filter(game => 
        game.distributionPlatform === 'android' || 
        game.distributionPlatform === 'ios' || 
        game.platform?.toLowerCase().includes('android') || 
        game.platform?.toLowerCase().includes('ios') || 
        game.platform?.toLowerCase().includes('mobile')
      )
    };
  };

  // Tüm oyunları filtre ve sıralama ayarlarına göre düzenle
  const getFilteredAndSortedGames = () => {
    const platforms = groupGamesByPlatform();
    let games: ExtendedEpicGame[] = [];
    
    // Filtreleme
    if (filter === "all") {
      games = [...epicGames, ...steamGames, ...gamerPowerGames];
    } else if (filter === "epic") {
      games = platforms.epic;
    } else if (filter === "steam") {
      games = platforms.steam;
    } else if (filter === "playstation") {
      games = platforms.playstation;
    } else if (filter === "xbox") {
      games = platforms.xbox;
    } else if (filter === "pc") {
      games = platforms.pc;
    } else if (filter === "mobile") {
      games = platforms.mobile;
    }
    
    // Sıralama
    return games.sort((a, b) => {
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      } else {
        // release date'e göre sırala (yeniden eskiye)
        const dateA = new Date(a.effectiveDate || 0);
        const dateB = new Date(b.effectiveDate || 0);
        return dateB.getTime() - dateA.getTime();
      }
    });
  };

  // Platform istatistiklerini hesapla
  const getPlatformStats = () => {
    const platforms = groupGamesByPlatform();
    const totalCount = epicGames.length + steamGames.length + gamerPowerGames.length;
    
    return {
      epicCount: platforms.epic.length,
      steamCount: platforms.steam.length,
      playstationCount: platforms.playstation.length,
      xboxCount: platforms.xbox.length,
      pcCount: platforms.pc.length,
      mobileCount: platforms.mobile.length,
      totalCount
    };
  };

  const filteredGames = getFilteredAndSortedGames();
  const stats = getPlatformStats();

  // Platformların gösterip gösterilmeyeceğine karar ver (0 oyun olanları gösterme)
  const shouldShowPlatform = (count: number) => count > 0;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between mb-6">
        <div className="flex flex-wrap justify-start gap-2">
          <button
            className={`px-4 py-2 rounded-md flex items-center justify-center ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
            onClick={() => setFilter("all")}
          >
            <span className="mr-2">Tüm Platformlar</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-white">
              {stats.totalCount}
            </span>
          </button>
          
          {shouldShowPlatform(stats.epicCount) && (
            <button
              className={`px-4 py-2 rounded-md flex items-center justify-center ${
                filter === "epic"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
              onClick={() => setFilter("epic")}
            >
              <SiEpicgames className="mr-2" />
              <span className="mr-2">Epic Games</span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-white">
                {stats.epicCount}
              </span>
            </button>
          )}
          
          {shouldShowPlatform(stats.steamCount) && (
            <button
              className={`px-4 py-2 rounded-md flex items-center justify-center ${
                filter === "steam"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
              onClick={() => setFilter("steam")}
            >
              <SiSteam className="mr-2" />
              <span className="mr-2">Steam</span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-white">
                {stats.steamCount}
              </span>
            </button>
          )}
          
          {shouldShowPlatform(stats.playstationCount) && (
            <button
              className={`px-4 py-2 rounded-md flex items-center justify-center ${
                filter === "playstation"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
              onClick={() => setFilter("playstation")}
            >
              <FaPlaystation className="mr-2" />
              <span className="mr-2">PlayStation</span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-white">
                {stats.playstationCount}
              </span>
            </button>
          )}
          
          {shouldShowPlatform(stats.xboxCount) && (
            <button
              className={`px-4 py-2 rounded-md flex items-center justify-center ${
                filter === "xbox"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
              onClick={() => setFilter("xbox")}
            >
              <FaXbox className="mr-2" />
              <span className="mr-2">Xbox</span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-white">
                {stats.xboxCount}
              </span>
            </button>
          )}
          
          {shouldShowPlatform(stats.pcCount) && (
            <button
              className={`px-4 py-2 rounded-md flex items-center justify-center ${
                filter === "pc"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
              onClick={() => setFilter("pc")}
            >
              <FaDesktop className="mr-2" />
              <span className="mr-2">PC</span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-white">
                {stats.pcCount}
              </span>
            </button>
          )}
          
          {shouldShowPlatform(stats.mobileCount) && (
            <button
              className={`px-4 py-2 rounded-md flex items-center justify-center ${
                filter === "mobile"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
              onClick={() => setFilter("mobile")}
            >
              <FaAndroid className="mr-2" />
              <span className="mr-2">Mobil</span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-white">
                {stats.mobileCount}
              </span>
            </button>
          )}
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            className={`px-4 py-2 rounded-md ${
              sortBy === "name"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
            onClick={() => setSortBy("name")}
          >
            İsme Göre
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              sortBy === "release"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
            onClick={() => setSortBy("release")}
          >
            Tarihe Göre
          </button>
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-300">Ücretsiz oyun bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard 
              key={game.id} 
              game={game}
              isFree={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FreeGamesList; 