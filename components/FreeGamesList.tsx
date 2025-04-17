import { useState } from "react";
import { EpicGame } from "@/lib/epic-api";
import GameCard from "./GameCard";
import { FaSteam, FaEpic } from "react-icons/fa";

interface FreeGamesListProps {
  epicGames: EpicGame[];
  steamGames: EpicGame[];
}

const FreeGamesList = ({ epicGames, steamGames }: FreeGamesListProps) => {
  const [filter, setFilter] = useState<"all" | "epic" | "steam">("all");
  const [sortBy, setSortBy] = useState<"name" | "release">("name");

  // Tüm oyunları filtre ve sıralama ayarlarına göre düzenle
  const getFilteredAndSortedGames = () => {
    let games: EpicGame[] = [];
    
    // Filtreleme
    if (filter === "all") {
      games = [...epicGames, ...steamGames];
    } else if (filter === "epic") {
      games = [...epicGames];
    } else {
      games = [...steamGames];
    }
    
    // Sıralama
    if (sortBy === "name") {
      games.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Yayınlanma tarihine göre sırala (en yeni üstte)
      games.sort((a, b) => {
        const dateA = new Date(a.effectiveDate || 0).getTime();
        const dateB = new Date(b.effectiveDate || 0).getTime();
        return dateB - dateA;
      });
    }
    
    return games;
  };

  const filteredAndSortedGames = getFilteredAndSortedGames();

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Şu Anda Ücretsiz Olan Oyunlar</h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex rounded-md shadow-sm">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } border border-gray-300`}
              onClick={() => setFilter("all")}
            >
              Tümü
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                filter === "epic"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } border-t border-b border-r border-gray-300`}
              onClick={() => setFilter("epic")}
            >
              <FaEpic /> Epic
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1 rounded-r-md ${
                filter === "steam"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } border-t border-b border-r border-gray-300`}
              onClick={() => setFilter("steam")}
            >
              <FaSteam /> Steam
            </button>
          </div>
          
          <div className="flex rounded-md shadow-sm">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                sortBy === "name"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } border border-gray-300`}
              onClick={() => setSortBy("name")}
            >
              Ada Göre
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                sortBy === "release"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } border-t border-b border-r border-gray-300`}
              onClick={() => setSortBy("release")}
            >
              Tarihe Göre
            </button>
          </div>
        </div>
      </div>

      {filteredAndSortedGames.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p>Şu anda ücretsiz oyun bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedGames.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              isFree 
              isSteam={steamGames.some(g => g.id === game.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FreeGamesList; 