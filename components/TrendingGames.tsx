import { ExtendedEpicGame } from "@/lib/types";

interface TrendingGamesProps {
  epicGames: ExtendedEpicGame[];
  gamerPowerGames?: ExtendedEpicGame[];
}

const TrendingGames = ({ epicGames, gamerPowerGames = [] }: TrendingGamesProps) => {
  return null;
};

export default TrendingGames; 