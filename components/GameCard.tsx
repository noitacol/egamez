import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSteam, FaWindows } from 'react-icons/fa';
import { SiEpicgames } from 'react-icons/si';
import { FaFire } from 'react-icons/fa';
import { BiGift } from 'react-icons/bi';
import { MdOutlineAccessTime } from 'react-icons/md';
import { ExtendedEpicGame, Price } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaExternalLinkAlt } from "react-icons/fa";
import { TbGift } from "react-icons/tb";
import { formatPrice } from "@/lib/utils";
import { 
  GiAntarctica, 
  GiGameConsole, 
  GiPc, 
  GiMicrophone, 
  GiTrophy, 
  GiPerspectiveDiceSixFacesRandom 
} from "react-icons/gi";
import { SiSteam } from "react-icons/si";
import { GamerPowerGame } from '@/lib/gamerpower-api';

interface GameCardProps {
  game: ExtendedEpicGame;
  isFree?: boolean;
  isUpcoming?: boolean;
  trending?: boolean;
  isLoot?: boolean;
  isBeta?: boolean;
  showPlatform?: boolean;
}

export const GameCard = ({ 
  game, 
  isFree, 
  isUpcoming, 
  trending,
  isLoot,
  isBeta,
  showPlatform = true
}: GameCardProps) => {
  // Pricing bileşeni - oyunun fiyat durumunu gösterir
  const Pricing = () => {
    // Oyunun fiyat bilgileri varsa
    if (game.price) {
      const totalPrice = (game.price as Price).totalPrice;
      const { fmtPrice, discountPrice, originalPrice } = totalPrice;
      
      // Ücretsiz veya 0 fiyatlı ise
      if (isFree || game.isFree || discountPrice === 0) {
        return (
          <div className="flex flex-col">
            <span className="text-green-500 font-bold">Ücretsiz</span>
            {originalPrice > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice, totalPrice?.currencyCode)}
              </span>
            )}
          </div>
        );
      }
      
      // İndirimli ürün göstergesi
      return (
        <div className="flex flex-col">
          <span className="font-semibold">
            {formatPrice(discountPrice, totalPrice?.currencyCode)}
          </span>
          {discountPrice < originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice, totalPrice?.currencyCode)}
            </span>
          )}
        </div>
      );
    }
    
    // GamerPower oyunları için
    if (game.isGamerPower) {
      // GamerPowerGame'in worth özelliğine özel olarak erişim sağla
      const worth = (game as ExtendedEpicGame & { worth?: string })?.worth;
      if (worth) {
        return (
          <div className="flex flex-col">
            <span className="text-green-500 font-bold">Ücretsiz</span>
            <span className="text-sm text-muted-foreground line-through">
              {worth}
            </span>
          </div>
        );
      }
    }
    
    // Diğer durumlar
    return (
      <span className="text-green-500 font-bold">
        {isFree || game.isFree ? "Ücretsiz" : ""}
      </span>
    );
  };

  // Kaynak ikonunu döndüren yardımcı fonksiyon
  const SourceIcon = () => {
    if (game.distributionPlatform === 'epic') {
      return <SiEpicgames className="h-4 w-4" />;
    } else if (game.distributionPlatform === 'steam') {
      return <SiSteam className="h-4 w-4" />;
    } else {
      return <TbGift className="h-4 w-4" />;
    }
  };

  // Oyun durumunu gösteren badge
  const StatusBadge = () => {
    if (isFree || game.isFree) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          Ücretsiz
        </Badge>
      );
    }
    
    if (isUpcoming) {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Yakında
        </Badge>
      );
    }
    
    if (trending) {
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
          Trend
        </Badge>
      );
    }
    
    if (isLoot) {
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
          Oyun İçi
        </Badge>
      );
    }
    
    if (isBeta) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Beta
        </Badge>
      );
    }
    
    return null;
  };

  // Kapak resmi için kaynağı belirle
  const getImageSource = () => {
    if (game.keyImages && game.keyImages.length > 0) {
      return game.keyImages[0].url;
    }
    
    // GamerPower veya diğer API'lardan gelen görsel alanlarını kontrol et
    const extendedGame = game as ExtendedEpicGame & { 
      image?: string, 
      thumbnail?: string 
    };
    
    if (typeof extendedGame.image === 'string') {
      return extendedGame.image;
    }
    
    if (typeof extendedGame.thumbnail === 'string') {
      return extendedGame.thumbnail;
    }
    
    return "/images/placeholder.png";
  };

  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <CardHeader className="p-0 aspect-[16/9] relative overflow-hidden">
        <Image
          src={getImageSource()}
          alt={game.title}
          fill
          className="object-cover transition-all group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <StatusBadge />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold leading-tight hover:text-primary transition-colors">{game.title}</h3>
          {showPlatform && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <SourceIcon />
              <span className="text-xs">{game.sourceLabel || game.source}</span>
            </div>
          )}
        </div>
        <div className="mt-2">
          <Pricing />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {game.url && (
          <Link href={game.url} target="_blank" className="w-full">
            <Button variant="outline" size="sm" className="w-full gap-2 font-normal text-xs">
              <FaExternalLinkAlt className="h-3 w-3" />
              Detaylar
            </Button>
          </Link>
        )}
        {game.id && !game.url && (
          <Link href={`/games/${game.id}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full gap-2 font-normal text-xs">
              <FaExternalLinkAlt className="h-3 w-3" />
              Detaylar
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default GameCard;