import { useState, useEffect } from "react";
import GameCard from "./GameCard";
import { SiEpicgames, SiSteam, SiPlaystation, SiBox, SiNintendoswitch } from "react-icons/si";
import { FaWindows, FaAndroid, FaApple } from "react-icons/fa";
import { ExtendedEpicGame } from "@/lib/types";

interface FreeGamesListProps {
  epicGames: ExtendedEpicGame[];
  steamGames: ExtendedEpicGame[];
  gamerPowerGames: ExtendedEpicGame[];
}

// Platform tiplerini tanımla
type PlatformType = "all" | "epic" | "steam" | "playstation" | "xbox" | "pc" | "mobile";

const FreeGamesList = ({ epicGames, steamGames, gamerPowerGames }: FreeGamesListProps) => {
  const [platform, setPlatform] = useState<PlatformType>("all");
  const [sortBy, setSortBy] = useState<"name" | "release">("name");
  const [searchTerm, setSearchTerm] = useState("");

  // Platformlara göre oyunları grupla
  const groupGamesByPlatform = () => {
    const allGames = [...epicGames, ...steamGames, ...gamerPowerGames];
    
    return {
      all: allGames,
      epic: allGames.filter(game => {
        const platform = game.distributionPlatform?.toLowerCase() || "";
        return platform.includes("epic");
      }),
      steam: allGames.filter(game => {
        const platform = game.distributionPlatform?.toLowerCase() || "";
        return platform.includes("steam");
      }),
      playstation: allGames.filter(game => {
        const platformName = game.platform?.toLowerCase() || "";
        return platformName.includes("playstation") || platformName.includes("ps4") || platformName.includes("ps5");
      }),
      xbox: allGames.filter(game => {
        const platformName = game.platform?.toLowerCase() || "";
        return platformName.includes("xbox");
      }),
      pc: allGames.filter(game => {
        const platformName = game.platform?.toLowerCase() || "";
        return platformName.includes("pc") || platformName.includes("windows");
      }),
      mobile: allGames.filter(game => {
        const platformName = game.platform?.toLowerCase() || "";
        return platformName.includes("android") || platformName.includes("ios") || platformName.includes("mobile");
      }),
    };
  };

  // Oyunları filtrele ve sırala
  const getFilteredAndSortedGames = () => {
    const groupedGames = groupGamesByPlatform();
    let filteredGames = groupedGames[platform];

    // Arama terimine göre filtrele
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      filteredGames = filteredGames.filter(game => 
        game.title.toLowerCase().includes(term) || 
        (game.description?.toLowerCase().includes(term) || false)
      );
    }

    // Sırala
    return [...filteredGames].sort((a, b) => {
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      } else {
        // Tarih sıralaması için effectiveDate kullan
        const dateA = new Date(a.effectiveDate || 0);
        const dateB = new Date(b.effectiveDate || 0);
        return dateB.getTime() - dateA.getTime();
      }
    });
  };

  const filteredGames = getFilteredAndSortedGames();

  // Platform istatistiklerini hesapla
  const getPlatformStats = () => {
    const groupedGames = groupGamesByPlatform();
    
    return {
      all: groupedGames.all.length,
      epic: groupedGames.epic.length,
      steam: groupedGames.steam.length,
      playstation: groupedGames.playstation.length,
      xbox: groupedGames.xbox.length,
      pc: groupedGames.pc.length,
      mobile: groupedGames.mobile.length,
    };
  };

  const platformStats = getPlatformStats();

  // Sadece oyun içeren platformları göster
  const shouldShowPlatform = (count: number) => count > 0;

  // Platform ikonlarını belirle
  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case "epic":
        return <SiEpicgames className="h-5 w-5" />;
      case "steam":
        return <SiSteam className="h-5 w-5" />;
      case "playstation":
        return <SiPlaystation className="h-5 w-5" />;
      case "xbox":
        return <SiBox className="h-5 w-5" />;
      case "pc":
        return <FaWindows className="h-5 w-5" />;
      case "mobile":
        return <FaAndroid className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Platform butonları
  const renderPlatformButtons = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`flex items-center px-4 py-2 rounded-md ${
            platform === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          }`}
          onClick={() => setPlatform("all")}
        >
          Tümü <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5">{platformStats.all}</span>
        </button>
        
        {shouldShowPlatform(platformStats.epic) && (
          <button
            className={`flex items-center px-4 py-2 rounded-md ${
              platform === "epic"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
            onClick={() => setPlatform("epic")}
          >
            <SiEpicgames className="mr-2" /> Epic <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5">{platformStats.epic}</span>
          </button>
        )}
        
        {shouldShowPlatform(platformStats.steam) && (
          <button
            className={`flex items-center px-4 py-2 rounded-md ${
              platform === "steam"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
            onClick={() => setPlatform("steam")}
          >
            <SiSteam className="mr-2" /> Steam <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5">{platformStats.steam}</span>
          </button>
        )}
        
        {shouldShowPlatform(platformStats.pc) && (
          <button
            className={`flex items-center px-4 py-2 rounded-md ${
              platform === "pc"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
            onClick={() => setPlatform("pc")}
          >
            <FaWindows className="mr-2" /> PC <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5">{platformStats.pc}</span>
          </button>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ücretsiz Oyunlar</h2>
        
        {/* Platform filtreleri */}
        {renderPlatformButtons()}
        
        {/* Arama ve sıralama */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Oyun ara..."
            className="flex-1 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
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