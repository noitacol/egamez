import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSteam, FaWindows } from 'react-icons/fa';
import { SiEpicgames } from 'react-icons/si';
import { FaFire } from 'react-icons/fa';
import { BiGift } from 'react-icons/bi';
import { MdOutlineAccessTime } from 'react-icons/md';
import { ExtendedEpicGame } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface GameCardProps {
  game: ExtendedEpicGame;
}

export const GameCard = ({ game }: GameCardProps) => {
  // Pricing bileşeni - oyunun fiyat durumunu gösterir
  const Pricing = () => {
    // Promosyonlu ürün kontrolü
    const hasPromotion = game.promotionalOffers && 
      game.promotionalOffers.length > 0 && 
      game.promotionalOffers[0].promotionalOffers && 
      game.promotionalOffers[0].promotionalOffers.length > 0;

    // Eğer oyun promosyonda değilse normal fiyatını göster
    if (!hasPromotion) {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {game.price === '0' ? 'Ücretsiz' : `${game.price}`}
          </span>
        </div>
      );
    }

    // Eğer oyun promosyonda ise indirimli fiyatı göster
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {game.originalPrice && game.originalPrice !== '0' && (
            <span className="text-xs line-through text-muted-foreground">
              {game.originalPrice}
            </span>
          )}
          <span className="text-sm font-medium text-green-500">
            {game.price === '0' ? 'Ücretsiz' : game.price}
          </span>
        </div>
      </div>
    );
  };

  // Kaynak ikonunu döndüren yardımcı fonksiyon
  const SourceIcon = () => {
    switch (game.source) {
      case 'epic':
        return <SiEpicgames className="h-4 w-4" />;
      case 'steam':
        return <FaSteam className="h-4 w-4" />;
      default:
        return <FaWindows className="h-4 w-4" />;
    }
  };

  // Oyun durumunu gösteren badge
  const StatusBadge = () => {
    if (game.status === 'free') {
      return (
        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <BiGift className="h-3 w-3" />
          Ücretsiz
        </div>
      );
    }
    
    if (game.status === 'upcoming') {
      return (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <MdOutlineAccessTime className="h-3 w-3" />
          Yakında Ücretsiz
        </div>
      );
    }
    
    if (game.trending) {
      return (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <FaFire className="h-3 w-3" />
          Trend
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {/* Oyun durumu badge'i */}
        <StatusBadge />
        
        {/* Platform etiketi */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <SourceIcon />
          {game.sourceLabel || game.platform}
        </div>
        
        {/* Oyun kapak resmi */}
        {game.keyImages && game.keyImages.length > 0 ? (
          <Image
            src={game.keyImages[0].url}
            alt={game.title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Resim yok</span>
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg line-clamp-1">{game.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {game.description || 'Açıklama yok'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <Pricing />
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="text-xs text-muted-foreground">
          {game.effectiveDate && new Date(game.effectiveDate).toLocaleDateString('tr-TR')}
        </div>
        
        {game.url && (
          <Link
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
          >
            Detaylar
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default GameCard;