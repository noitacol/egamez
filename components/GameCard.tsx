import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExtendedEpicGame } from '@/lib/types';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SiEpicgames, SiSteam } from 'react-icons/si';
import { BiGift } from 'react-icons/bi';
import { FaFire } from 'react-icons/fa';
import { MdOutlineAccessTime } from 'react-icons/md';
import { MdLocalOffer } from 'react-icons/md';
import { RiTestTubeFill } from 'react-icons/ri';

interface GameCardProps {
  game: ExtendedEpicGame;
  isFree?: boolean;
  isUpcoming?: boolean;
  trending?: boolean;
  isLoot?: boolean;
  isBeta?: boolean;
  showPlatform?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ 
  game, 
  isFree = false,
  isUpcoming = false,
  trending = false,
  isLoot = false,
  isBeta = false,
  showPlatform = true
}) => {
  if (!game) return null;

  // Geçici görsel URL'yi alın
  let imageUrl = '/placeholder.jpg';
  
  if (game.keyImages && game.keyImages.length > 0) {
    // Tercih edilen görsel sıralaması
    const preferredTypes = [
      'DieselGameBoxTall',
      'DieselGameBoxLogo',
      'Thumbnail',
      'OfferImageTall', 
      'OfferImageWide',
      'DieselStoreFrontWide'
    ];
    
    // Tercih edilen tiplere göre bir görsel bulmaya çalış
    for (const type of preferredTypes) {
      const image = game.keyImages.find(img => img.type === type);
      if (image && image.url) {
        imageUrl = image.url;
        break;
      }
    }
    
    // Hiçbir tercih edilen tip bulunamazsa ilk görseli kullan
    if (imageUrl === '/placeholder.jpg' && game.keyImages[0]?.url) {
      imageUrl = game.keyImages[0].url;
    }
  }

  // Platformu belirle
  const platform = game.distributionPlatform?.toLowerCase() || '';
  const isPlatformEpic = platform === 'epic';
  const isPlatformSteam = platform === 'steam';

  // Oyun başlığını formatla
  const title = game.title || 'Bilinmeyen Oyun';

  // Badge türünü belirle
  const getBadgeInfo = () => {
    if (isUpcoming) {
      return {
        text: 'Yakında',
        icon: <MdOutlineAccessTime className="mr-1" />,
        color: 'bg-gradient-to-r from-yellow-600 to-orange-600'
      };
    } else if (trending) {
      return {
        text: 'Trend',
        icon: <FaFire className="mr-1" />,
        color: 'bg-gradient-to-r from-red-500 to-orange-500'
      };
    } else if (isLoot) {
      return {
        text: 'Loot',
        icon: <BiGift className="mr-1" />,
        color: 'bg-gradient-to-r from-purple-500 to-pink-500'
      };
    } else if (isBeta) {
      return {
        text: 'Beta',
        icon: <RiTestTubeFill className="mr-1" />,
        color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
      };
    } else {
      return {
        text: 'Ücretsiz',
        icon: <MdLocalOffer className="mr-1" />,
        color: 'bg-gradient-to-r from-green-500 to-emerald-600'
      };
    }
  };

  const badge = getBadgeInfo();

  // URL'nin geçerli olup olmadığını kontrol et
  const safeUrl = game.url || '#';

  return (
    <Card className="game-card overflow-hidden group h-full flex flex-col transition-shadow hover:shadow-xl">
      <CardHeader className="p-0 game-card-image relative overflow-hidden">
        <Link href={safeUrl} target="_blank" rel="noopener noreferrer" className="block relative h-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'cover' }}
            className="group-hover:scale-110 transition-transform duration-500 ease-in-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>
        </Link>
        
        {/* Badge */}
        <div className={`game-card-badge px-2 py-1 text-xs font-bold rounded-full flex items-center ${badge.color}`}>
          {badge.icon}
          {badge.text}
        </div>

        {/* Platform Icon */}
        {showPlatform && (
          <div className="absolute bottom-2 right-2 z-10">
            {isPlatformEpic && <SiEpicgames className="text-white h-5 w-5" />}
            {isPlatformSteam && <SiSteam className="text-white h-5 w-5" />}
          </div>
        )}
      </CardHeader>
      <CardContent className="game-card-content p-3 sm:p-4 flex-grow">
        <h3 className="game-card-title font-bold text-lg line-clamp-1 mb-1">
          <Link href={safeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
            {title}
          </Link>
        </h3>
        
        {game.description && (
          <p className="game-card-description text-sm text-gray-300 line-clamp-2 mb-3">
            {game.description.substring(0, 80)}
            {game.description.length > 80 ? '...' : ''}
          </p>
        )}
        
        <Link 
          href={safeUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>Görüntüle</span>
          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </CardContent>
    </Card>
  );
};

export default GameCard;