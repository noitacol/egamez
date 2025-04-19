import React from 'react';
import { FaWindows, FaApple, FaAndroid, FaPlaystation, FaXbox, FaSteam, FaGamepad } from 'react-icons/fa';
import { SiNintendoswitch, SiIos, SiEpicgames } from 'react-icons/si';

interface PlatformIconProps {
  platform: string;
  className?: string;
  size?: number;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = "text-lg", size }) => {
  const platformLower = platform.toLowerCase();
  
  if (platformLower.includes('win') || platformLower.includes('windows')) {
    return <FaWindows className={className} size={size} />;
  } 
  
  if (platformLower.includes('mac') || platformLower.includes('macos')) {
    return <FaApple className={className} size={size} />;
  }
  
  if (platformLower.includes('ios') || platformLower === 'apple') {
    return <SiIos className={className} size={size} />;
  }
  
  if (platformLower.includes('android')) {
    return <FaAndroid className={className} size={size} />;
  }
  
  if (platformLower.includes('playstation') || platformLower.includes('ps')) {
    return <FaPlaystation className={className} size={size} />;
  }
  
  if (platformLower.includes('xbox')) {
    return <FaXbox className={className} size={size} />;
  }
  
  if (platformLower.includes('switch') || platformLower.includes('nintendo')) {
    return <SiNintendoswitch className={className} size={size} />;
  }
  
  if (platformLower.includes('steam')) {
    return <FaSteam className={className} size={size} />;
  }
  
  if (platformLower.includes('epic')) {
    return <SiEpicgames className={className} size={size} />;
  }
  
  if (platformLower.includes('gamerpower')) {
    return <FaGamepad className={className} size={size} />;
  }
  
  // Varsayılan simge
  return <FaGamepad className={className} size={size} />;
};

export default PlatformIcon; 