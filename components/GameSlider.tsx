import React, { ReactNode } from 'react';
import { ExtendedEpicGame } from './GameCard';
import GameCard from './GameCard';
import Slider from './Slider';
import { IconType } from 'react-icons';

interface GameSliderProps {
  games: ExtendedEpicGame[];
  title: string;
  emptyMessage?: string;
  icon?: ReactNode;
  isFree?: boolean;
  isUpcoming?: boolean;
  isTrending?: boolean;
}

const GameSlider: React.FC<GameSliderProps> = ({
  games,
  title,
  emptyMessage = "Şu anda oyun bulunamadı.",
  icon,
  isFree = false,
  isUpcoming = false,
  isTrending = false,
}) => {
  if (!games || games.length === 0) {
    return (
      <div className="my-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Slider title={title} icon={icon}>
      {games.map((game) => (
        <div key={game.id} className="keen-slider__slide">
          <GameCard 
            game={game} 
            isFree={isFree} 
            isUpcoming={isUpcoming} 
            isTrending={isTrending} 
          />
        </div>
      ))}
    </Slider>
  );
};

export default GameSlider; 