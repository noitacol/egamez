import { EpicGame } from "@/lib/epic-api";
import GameCard from "./GameCard";

interface UpcomingGamesProps {
  upcomingGames: EpicGame[];
}

const UpcomingGames = ({ upcomingGames }: UpcomingGamesProps) => {
  if (!upcomingGames || upcomingGames.length === 0) {
    return null;
  }

  // Yaklaşan oyunları tarihe göre sıralayalım
  const sortedGames = [...upcomingGames].sort((a, b) => {
    const startDateA = a.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate || "";
    const startDateB = b.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0]?.startDate || "";
    
    return new Date(startDateA).getTime() - new Date(startDateB).getTime();
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Yakında Ücretsiz Olacak Oyunlar</h2>
        <p className="text-gray-600">
          Epic Games Store'da yakında ücretsiz olacak {upcomingGames.length} oyun mevcut.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedGames.map((game) => (
          <GameCard 
            key={game.id}
            game={game}
            isUpcoming
          />
        ))}
      </div>
    </div>
  );
};

export default UpcomingGames; 