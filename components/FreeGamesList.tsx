import { useState } from "react";
import GameCard from "./GameCard";
import { SiEpicgames, SiSteam } from "react-icons/si";
import { IoPlanetOutline } from "react-icons/io5";
import { FaGamepad } from "react-icons/fa";
import { ExtendedEpicGame } from "@/lib/types";

interface FreeGamesListProps {
  epicGames: ExtendedEpicGame[];
  steamGames: ExtendedEpicGame[];
  gamerPowerGames: ExtendedEpicGame[];
}

const FreeGamesList = ({ epicGames, steamGames, gamerPowerGames }: FreeGamesListProps) => {
  const [filter, setFilter] = useState<"all" | "epic" | "steam" | "other">("all");
  const [sortBy, setSortBy] = useState<"name" | "release">("name");

  // GamerPower oyunlarını platformlarına göre grupla
  const groupGamerPowerGamesByPlatform = () => {
    const epicFromGamerPower = gamerPowerGames.filter(
      game => game.distributionPlatform === 'epic'
    );
    
    const steamFromGamerPower = gamerPowerGames.filter(
      game => game.distributionPlatform === 'steam'
    );
    
    const otherPlatformGames = gamerPowerGames.filter(
      game => game.distributionPlatform !== 'epic' && game.distributionPlatform !== 'steam'
    );
    
    return {
      epicFromGamerPower,
      steamFromGamerPower,
      otherPlatformGames
    };
  };

  // Tüm oyunları filtre ve sıralama ayarlarına göre düzenle
  const getFilteredAndSortedGames = () => {
    let games: ExtendedEpicGame[] = [];
    const { epicFromGamerPower, steamFromGamerPower, otherPlatformGames } = groupGamerPowerGamesByPlatform();
    
    // Filtreleme
    if (filter === "all") {
      games = [...epicGames, ...steamGames, ...gamerPowerGames];
    } else if (filter === "epic") {
      games = [...epicGames, ...epicFromGamerPower];
    } else if (filter === "steam") {
      games = [...steamGames, ...steamFromGamerPower];
    } else if (filter === "other") {
      games = [...otherPlatformGames];
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
    const { epicFromGamerPower, steamFromGamerPower, otherPlatformGames } = groupGamerPowerGamesByPlatform();
    
    return {
      epicCount: epicGames.length + epicFromGamerPower.length,
      steamCount: steamGames.length + steamFromGamerPower.length,
      otherCount: otherPlatformGames.length,
      totalCount: epicGames.length + steamGames.length + gamerPowerGames.length
    };
  };

  const filteredGames = getFilteredAndSortedGames();
  const stats = getPlatformStats();

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between mb-6">
        <div className="flex flex-col md:flex-row mb-4 md:mb-0 space-y-2 md:space-y-0 md:space-x-2">
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
          
          <button
            className={`px-4 py-2 rounded-md flex items-center justify-center ${
              filter === "other"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
            onClick={() => setFilter("other")}
          >
            <FaGamepad className="mr-2" />
            <span className="mr-2">Diğer Platformlar</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-white">
              {stats.otherCount}
            </span>
          </button>
        </div>
        
        <div className="flex space-x-2">
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