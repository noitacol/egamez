import { useState } from "react";
import GameCard from "./GameCard";
import { SiEpicgames } from "react-icons/si";
import { IoPlanetOutline } from "react-icons/io5";
import { ExtendedEpicGame } from "@/lib/types";

interface FreeGamesListProps {
  epicGames: ExtendedEpicGame[];
  steamGames: ExtendedEpicGame[]; // Artık GamerPower oyunlarını içeriyor
}

const FreeGamesList = ({ epicGames, steamGames }: FreeGamesListProps) => {
  const [filter, setFilter] = useState<"all" | "epic" | "gamerpower">("all");
  const [sortBy, setSortBy] = useState<"name" | "release">("name");

  // Güvenli bir string karşılaştırma fonksiyonu
  const safeCompare = (a: string | undefined | null, b: string | undefined | null) => {
    // Eğer her iki değer de tanımlı değilse 0 döndür (eşit kabul et)
    if (!a && !b) return 0;
    // Eğer sadece a tanımlı değilse b önce gelsin
    if (!a) return 1;
    // Eğer sadece b tanımlı değilse a önce gelsin
    if (!b) return -1;
    // Her iki değer de tanımlıysa normal karşılaştırma yap
    return a.localeCompare(b);
  };

  // Tüm oyunları filtre ve sıralama ayarlarına göre düzenle
  const getFilteredAndSortedGames = () => {
    let games: ExtendedEpicGame[] = [];
    
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
      games.sort((a, b) => safeCompare(a.title, b.title));
    } else {
      // Yayınlanma tarihine göre sırala (en yeni üstte)
      games.sort((a, b) => {
        const dateA = a.effectiveDate ? new Date(a.effectiveDate).getTime() : 0;
        const dateB = b.effectiveDate ? new Date(b.effectiveDate).getTime() : 0;
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
              <SiEpicgames /> Epic
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1 rounded-r-md ${
                filter === "gamerpower"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } border-t border-b border-r border-gray-300`}
              onClick={() => setFilter("gamerpower")}
            >
              <IoPlanetOutline /> GamerPower
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
              isGamerPower={game.source === "gamerpower"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FreeGamesList; 