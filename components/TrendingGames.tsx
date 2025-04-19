import { useState } from "react";
import Image from "next/image";
import { EpicGame } from "@/lib/epic-api";
import GameCard from "./GameCard";
import { ExtendedEpicGame } from "@/lib/types";

interface TrendingGamesProps {
  epicGames: ExtendedEpicGame[];
  gamerPowerGames?: ExtendedEpicGame[];
}

const TrendingGames = ({ epicGames, gamerPowerGames = [] }: TrendingGamesProps) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "epic" | "gamerpower">("all");
  
  // Oyunları kaynaklarına göre filtrele
  const filteredGames = () => {
    switch (activeFilter) {
      case "epic":
        return epicGames;
      case "gamerpower":
        return gamerPowerGames;
      default:
        return [
          ...epicGames,
          ...gamerPowerGames
        ];
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Trend Oyunlar</h2>
        
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            onClick={() => setActiveFilter("all")}
          >
            Tümü
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === "epic" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            onClick={() => setActiveFilter("epic")}
          >
            Epic
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === "gamerpower" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            onClick={() => setActiveFilter("gamerpower")}
          >
            GamerPower
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames().map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            trending 
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingGames; 