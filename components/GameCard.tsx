import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExtendedEpicGame } from '@/lib/types';
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
      'Thumbnail',
      'DieselGameBoxLogo',
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
        color: 'bg-yellow-600'
      };
    } else if (trending) {
      return {
        text: 'Trend',
        color: 'bg-red-600'
      };
    } else if (isLoot) {
      return {
        text: 'Loot',
        color: 'bg-purple-600'
      };
    } else if (isBeta) {
      return {
        text: 'Beta',
        color: 'bg-blue-600'
      };
    } else {
      return {
        text: 'Ücretsiz',
        color: 'bg-blue-600'
      };
    }
  };

  const badge = getBadgeInfo();

  // URL'nin geçerli olup olmadığını kontrol et
  const safeUrl = game.url || '#';
  
  // Fiyat bilgisi
  const originalPrice = game.price?.totalPrice?.originalPrice || 0;
  const discountPrice = game.price?.totalPrice?.discountPrice || 0;
  const hasDiscount = originalPrice > discountPrice && discountPrice > 0;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;
  
  // Fiyat formatı
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="epic-game-card">
      <div className="epic-game-card-image">
        <Link href={safeUrl} target="_blank" rel="noopener noreferrer">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="epic-game-card-thumbnail"
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
          {isFree && (
            <span className="epic-free-tag">{badge.text}</span>
          )}
        </Link>
        
        {/* Platform Icon */}
        {showPlatform && (
          <div className="absolute bottom-2 left-2 z-10 bg-black/60 p-1 rounded">
            {isPlatformEpic && <SiEpicgames className="text-white h-4 w-4" />}
            {isPlatformSteam && <SiSteam className="text-white h-4 w-4" />}
          </div>
        )}
      </div>
      
      <div className="epic-game-card-content">
        <h3 className="epic-game-card-title">
          <Link href={safeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
            {title}
          </Link>
        </h3>
        
        {game.description && (
          <p className="epic-game-card-subtitle line-clamp-2">
            {game.description.substring(0, 80)}
            {game.description.length > 80 ? '...' : ''}
          </p>
        )}
        
        <div className="epic-game-card-price flex items-center mt-auto">
          {hasDiscount ? (
            <>
              <span className="epic-game-card-discount mr-2">-{discountPercentage}%</span>
              <span className="line-through text-gray-400 text-xs mr-2">{formatPrice(originalPrice)}</span>
              <span className="text-white">{formatPrice(discountPrice)}</span>
            </>
          ) : discountPrice > 0 ? (
            <span>{formatPrice(discountPrice)}</span>
          ) : isFree ? (
            <span className="text-blue-500 font-bold">Ücretsiz</span>
          ) : (
            <span className="text-gray-400">Yakında</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;